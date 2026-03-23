// Ações que o DemoController pode disparar em páginas específicas
type ActionFn = () => void;

const registry: Record<string, ActionFn> = {};

export function registerDemoAction(key: string, fn: ActionFn) {
  registry[key] = fn;
}

export function triggerDemoAction(key: string) {
  registry[key]?.();
}
