export type VNode =
  | {
      type: string | Function;
      props: Record<string, any>;
      children: VNode[];
    }
  | Primitive;

export type Primitive = string | number | boolean | null | undefined;
