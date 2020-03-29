export interface TypeMetadata {
  argType: SingletonArgumentType;
  values: string[];
}

export type SingletonArgumentType =
  | ArgumentType.STRING
  | ArgumentType.NUMBER
  | ArgumentType.BOOLEAN
  | ArgumentType.ENUM
  | ArgumentType.OBJECT;

export enum ArgumentType {
  STRING,
  NUMBER,
  BOOLEAN,
  ENUM,
  OBJECT,
  ARRAY,
}

export interface IMethodArgument {
  name?: string;
  type: ArgumentType;
}

export interface StringMethodArgument extends IMethodArgument {
  type: ArgumentType.STRING;
}

export interface NumberMethodArgument extends IMethodArgument {
  type: ArgumentType.NUMBER;
}

export interface BooleanMethodArgument extends IMethodArgument {
  type: ArgumentType.BOOLEAN;
}

export interface EnumMethodArgument extends IMethodArgument {
  type: ArgumentType.ENUM;
  values: string[];
}

export interface ObjectMethodArgument extends IMethodArgument {
  type: ArgumentType.OBJECT;
  args: MethodArgument[];
}

export type SingleMethodArgument =
  | StringMethodArgument
  | NumberMethodArgument
  | BooleanMethodArgument
  | EnumMethodArgument
  | ObjectMethodArgument;

export interface ArrayMethodArgument extends IMethodArgument {
  type: ArgumentType.ARRAY;
  args: MethodArgument;
}

export type MethodArgument = SingleMethodArgument | ArrayMethodArgument;
