import type { VNode } from "./types";

export function createVNode(
  type: string | Function,
  props: Record<string, any>,
  ...children: VNode[]
) {
  return {
    type,
    props,
    children: (children as unknown[])
      .flat(Infinity)
      .filter((value) => Boolean(value) || value === 0) as VNode[],
  };
}
