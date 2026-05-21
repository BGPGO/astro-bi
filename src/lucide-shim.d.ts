/**
 * Shim para deep imports do lucide-react.
 *
 * Workaround pra lucide-react@1.16.0 com aggregator quebrado em CI.
 * Localmente o npm install reinstala tudo, mas npm ci no Docker é mais
 * estrito e o barrel quebrado faz tsc reclamar.
 *
 * Solução: declarar módulo wildcard pra qualquer `lucide-react/dist/esm/icons/*`
 * — o tipo é o LucideIcon padrão (ForwardRefExoticComponent).
 */
declare module "lucide-react/dist/esm/icons/*" {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
  export interface LucideProps extends Partial<SVGProps<SVGSVGElement>> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  export type LucideIcon = ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>;
  const icon: LucideIcon;
  export default icon;
}
