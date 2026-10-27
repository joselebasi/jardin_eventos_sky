import { ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
    href: string;
    label: string;
    variant?: "default" | "outline" | "ghost" | "link";
    className?: string;
    arrow?: boolean;
    external?: boolean;
};

export default function ActionLink({ href, label, variant = "default", className, arrow = true, external = false }: Readonly<Props>) {
    return <Button asChild variant={variant} size="lg" className={className}><a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>{label}{arrow && <ArrowUpRight aria-hidden="true" />}</a></Button>;
}
