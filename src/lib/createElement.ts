/** @jsx createVNode */
import { addEvent } from "./eventManager";
import type { VNode } from "./types";

export function createElement(vNode: VNode): Node {
  // 1. 빈 값은 빈 텍스트 노드로 변환
  if (vNode === undefined || vNode === null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 2. 텍스트 노드 처리
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode.toString());
  }

  // 3. 배열 처리
  if (Array.isArray(vNode)) {
    const $el = document.createDocumentFragment();
    vNode.forEach((child) => $el.appendChild(createElement(child)));
    return $el;
  }

  // 4. 함수형 컴포넌트 처리
  if (typeof vNode.type === "function") {
    throw new Error("컴포넌트는 `createElement()`로 처리할 수 없습니다.");
  }

  // 5. 일반적인 DOM 요소 노드 처리
  const { type, props, children } = vNode;
  const $el = document.createElement(type);

  // 6. 속성(props) 설정
  updateAttributes($el, props);

  // 7. 자식 노드들 렌더링 및 추가
  $el.append(...children.map(createElement));

  return $el;
}

function updateAttributes($el: HTMLElement, props: Record<string, any>) {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    // 'children' prop은 속성이 아니므로 건너뜁니다.
    if (key === "children") continue;

    // 이벤트 핸들러 설정 (e.g., onClick)
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      addEvent($el, eventType, value);
      continue;
    }

    // className을 class 속성으로 변환
    if (key === "className") {
      $el.setAttribute("class", value);
      continue;
    }

    // style 객체 처리
    if (key === "style" && typeof value === "object") {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        ($el.style as any)[styleKey] = styleValue;
      });
      continue;
    }

    // data-* 속성 처리
    if (key.startsWith("data-")) {
      $el.setAttribute(key, value);
      continue;
    }

    // 기타 모든 속성 설정
    $el.setAttribute(key, value);
  }
}
