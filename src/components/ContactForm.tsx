import { useState, type ComponentProps } from "react";
import { Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Textarea } from "./ui/textarea";

export default function ContactForm() {
    const [status, setStatus] = useState("");
    const handleSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = (event) => {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const getText = (key: string) => {
            const value = fields.get(key);
            return typeof value === "string" ? value.trim() : "";
        };
        const name = getText("name");
        const email = getText("email");
        const eventType = getText("event_type");
        const message = getText("message");
        const subject = `Solicitud de evento: ${eventType}`;
        const body = `Nombre: ${name}\nCorreo: ${email}\nEvento: ${eventType}\n\n${message}`;
        window.location.href = `mailto:jardineventosky@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setStatus("Solicitud preparada. Completa el env\u00edo en tu aplicaci\u00f3n de correo.");
    };
    return (
        <form action="mailto:jardineventosky@gmail.com" method="post" encType="text/plain" onSubmit={handleSubmit} className="space-y-6 text-foreground">
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" autoComplete="name" placeholder="Tu nombre" required maxLength={120} className="h-12 bg-background text-base" />
                </div>
                <div className="space-y-3">
                    <Label htmlFor="email">Correo</Label>
                    <Input id="email" name="email" type="email" autoComplete="email" placeholder="tu@email.com" required maxLength={254} className="h-12 bg-background text-base" />
                </div>
            </div>
            <div className="space-y-3 [&>[data-slot=native-select-wrapper]]:w-full">
                <Label htmlFor="event_type">Tipo de evento</Label>
                <NativeSelect id="event_type" name="event_type" defaultValue="Boda" required className="h-12 bg-background text-base">
                    <NativeSelectOption value="Boda">Boda</NativeSelectOption>
                    <NativeSelectOption value="XV Años">XV Años</NativeSelectOption>
                    <NativeSelectOption value="Evento corporativo">Evento corporativo</NativeSelectOption>
                    <NativeSelectOption value="Otro">Otro</NativeSelectOption>
                </NativeSelect>
            </div>
            <div className="space-y-3">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" name="message" rows={5} placeholder="Cuéntanos más sobre tu evento..." required maxLength={2000} className="resize-y bg-background text-base" />
            </div>
            <Button type="submit" size="lg" className="min-h-12 w-full"><Mail aria-hidden="true" />Preparar correo</Button>
            <p role="status" aria-live="polite" className="text-sm leading-relaxed text-muted-foreground">{status}</p>
        </form>
    );
}
