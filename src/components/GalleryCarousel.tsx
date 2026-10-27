import { useEffect, useRef, useState } from "react";
import { Expand, X } from "lucide-react";
import { Button } from "./ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "./ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

const images = [
    { src: "/uno.webp", title: "Entre palmeras", alt: "Alberca al aire libre rodeada de palmeras y vegetaci\u00f3n" },
    { src: "/dos.webp", title: "Espacio para compartir", alt: "Vista amplia de la alberca junto al jard\u00edn y zona de descanso" },
    { src: "/tres.webp", title: "El sonido del agua", alt: "Alberca con cascada de piedra y palmeras al fondo" },
];

export default function GalleryCarousel() {
    const [api, setApi] = useState<CarouselApi>();
    const [selected, setSelected] = useState(0);
    const [expanded, setExpanded] = useState(0);
    const trigger = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        if (!api) return;
        const update = () => setSelected(api.selectedScrollSnap());
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateMotion = () => api.reInit({ duration: motion.matches ? 0 : 35 });
        updateMotion();
        update();
        api.on("select", update).on("reInit", update);
        motion.addEventListener("change", updateMotion);
        return () => {
            api.off("select", update).off("reInit", update);
            motion.removeEventListener("change", updateMotion);
        };
    }, [api]);
    const activeImage = images[expanded];
    return (
        <Dialog>
            <Carousel opts={{ align: "center", loop: true }} setApi={setApi} aria-label="Fotografías del jardín" className="w-full">
                <CarouselContent className="touch-pan-y items-center py-6">
                    {images.map((image, index) => (
                        <CarouselItem key={image.src} aria-label={`${index + 1} de ${images.length}`} className="basis-[90%] sm:basis-[78%] lg:basis-[68%]">
                            <DialogTrigger asChild>
                                <Button type="button" variant="ghost" data-gallery-image aria-label={`Ampliar imagen: ${image.alt}`} onFocus={() => api?.scrollTo(index)} onClick={(event) => { trigger.current = event.currentTarget; setExpanded(index); }} className={`group relative block h-auto w-full overflow-hidden rounded-lg border border-border p-0 text-left whitespace-normal shadow-lg transition-[transform,opacity,box-shadow] duration-500 ease-out hover:bg-transparent motion-reduce:transition-none ${selected === index ? "scale-100 opacity-100 shadow-xl" : "scale-[0.94] opacity-65 hover:opacity-90"}`}>
                                    <img className="gallery-image aspect-4/3 w-full object-cover" src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
                                    <span className="absolute right-16 bottom-5 left-5 text-white sm:bottom-7 sm:left-7">
                                        <span className="mb-2 block text-xs font-medium text-white/80">JARDÍN SKY / 0{index + 1}</span>
                                        <span className="block font-display text-base leading-snug sm:text-2xl">{image.title}</span>
                                    </span>
                                    <span className="absolute right-4 bottom-5 grid size-11 place-items-center rounded-md border border-white/50 bg-black/20 text-white" title="Ampliar imagen"><Expand aria-hidden="true" /></span>
                                </Button>
                            </DialogTrigger>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
                    <p className="text-sm text-muted-foreground" role="status" aria-live="polite" aria-atomic="true"><span className="font-medium text-foreground">0{selected + 1}</span> / 0{images.length}</p>
                    <div className="flex items-center">
                        {images.map((image, index) => <Button key={image.src} type="button" variant="ghost" size="icon" className="size-11" aria-label={`Ver fotografía ${index + 1}`} aria-pressed={selected === index} title={`Ver fotografía ${index + 1}`} onClick={() => api?.scrollTo(index)}><span className={`h-1 rounded-full transition-all motion-reduce:transition-none ${selected === index ? "w-7 bg-primary" : "w-2 bg-muted-foreground/50"}`} /></Button>)}
                    </div>
                    <div className="flex gap-2">
                        <CarouselPrevious className="static size-11 translate-none rounded-md" title="Fotografía anterior" />
                        <CarouselNext className="static size-11 translate-none rounded-md" title="Fotografía siguiente" />
                    </div>
                </div>
            </Carousel>
            <DialogContent showCloseButton={false} aria-describedby={undefined} onCloseAutoFocus={(event) => { event.preventDefault(); trigger.current?.focus(); }} className="max-h-[95dvh] overflow-y-auto border-border p-3 text-foreground motion-reduce:animate-none sm:max-w-6xl sm:p-5">
                <figure>
                    <img src={activeImage.src} alt={activeImage.alt} className="mx-auto max-h-[75dvh] w-full rounded-md object-contain" />
                    <DialogTitle asChild><figcaption className="mt-4 pr-12 text-sm leading-relaxed font-normal">{activeImage.alt}</figcaption></DialogTitle>
                </figure>
                <DialogClose asChild><Button type="button" variant="outline" size="icon" className="absolute top-5 right-5 size-11" aria-label="Cerrar imagen ampliada" title="Cerrar imagen ampliada"><X aria-hidden="true" /></Button></DialogClose>
            </DialogContent>
        </Dialog>
    );
}
