import { UsernamePasswordInput } from "@inputs/UsernamePasswordInput";
import { emailRegex } from "./regex";

export function validateRegister(options: UsernamePasswordInput) {
  if (!emailRegex.test(options.email)) {
    return [{ field: "email", message: "invalid email" }];
  }
  if (options.username.length <= 2) {
    return [{ field: "username", message: "length must be grater than 2" }];
  }
  if (options.username.includes("@")) {
    return [{ field: "username", message: "cannot include an @" }];
  }
  if (options.password.length <= 3) {
    return [{ field: "password", message: "length must be grater than 3" }];
  }

  return null;
}

export function validatePassword(password: string, field: string) {
  if (password.length <= 3) {
    return [{ field, message: "length must be grater than 3" }];
  }

  return null;
}
