import { Type } from "@sinclair/typebox";

export const SignUpBody = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
});

export const SignInBody = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 1 }),
});

export const RevalidateBody = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
});

export const ResetPasswordBody = Type.Object({
  email: Type.String({ format: "email" }),
});

export const ConfirmResetPasswordBody = Type.Object({
  token: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 8 }),
});
