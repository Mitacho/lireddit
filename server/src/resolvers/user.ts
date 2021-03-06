import {
  FORGET_PASSWORD_EXPIRATION,
  REDIS_FORGET_PASSWORD_PREFIX,
  SESSION_KEY,
} from "@constants";
import { User } from "@entities/User";
import { UsernamePasswordInput } from "@inputs/UsernamePasswordInput";
import type { Context } from "@types";
import { emailRegex } from "@utils/regex";
import sendEmail from "@utils/sendEmail";
import { validatePassword, validateRegister } from "@utils/validators";
import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { request }: Context) {
    const userId = request.session.get(SESSION_KEY);
    if (userId === user.id) {
      return user.email;
    }

    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { request, redis }: Context
  ): Promise<UserResponse> {
    const passwordErrors = validatePassword(newPassword, "newPassword");

    if (passwordErrors) {
      return {
        errors: passwordErrors,
      };
    }

    const key = REDIS_FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [{ field: "token", message: "token expired" }],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [{ field: "token", message: "user no longer exists" }],
      };
    }

    await User.update(
      {
        id: userIdNum,
      },
      {
        password: await argon2.hash(newPassword),
      }
    );
    await redis.del(key);

    request.session.set(SESSION_KEY, user.id);

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { redis }: Context) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const token = v4();

    redis.set(
      REDIS_FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      FORGET_PASSWORD_EXPIRATION
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { request }: Context) {
    if (!request.session.get(SESSION_KEY)) {
      return null;
    }

    return User.findOne(request.session.get(SESSION_KEY));
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { request }: Context
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      user = await User.create({
        username: options.username,
        email: options.email,
        password: hashedPassword,
      }).save();
      // const result = await getConnection()
      //   .createQueryBuilder()
      //   .insert()
      //   .into(User)
      //   .values({
      //     username: options.username,
      //     email: options.email,
      //     password: hashedPassword,
      //   })
      //   .returning("*")
      //   .execute();

      // user = result.raw[0];
      console.log(user);
      request.session.set(SESSION_KEY, user.id);
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [{ field: "username", message: "username already taken" }],
        };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { request }: Context
  ): Promise<UserResponse> {
    const user = await User.findOne(
      emailRegex.test(usernameOrEmail)
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          { field: "usernameOrEmail", message: "username doesn't exist" },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [{ field: "password", message: "incorrect password" }],
      };
    }

    request.session.set(SESSION_KEY, user.id);

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { request }: Context) {
    return new Promise((resolve) => {
      try {
        request.session.delete();
        resolve(true);
        return;
      } catch {
        resolve(false);
      }
    });
  }
}
