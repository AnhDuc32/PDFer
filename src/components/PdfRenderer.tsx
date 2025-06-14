"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Lightbulb,
  Loader2,
  RotateCw,
  Search,
  TimerReset,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import QuizCreation from "./QuizCreation";
import History from "./History";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfRendererProps {
  url: string;
  fileId: string;
}

const PdfRenderer = ({ url, fileId }: PdfRendererProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const { width, ref } = useResizeDetector();

  const [numPages, setNumPages] = useState<number>();

  const [currPage, setCurrPage] = useState<number>(1);

  const [scale, setScale] = useState<number>(1);

  const [rotation, setRotation] = useState<number>(0);

  const [renderScale, setRenderScale] = useState<number | null>(null);

  const isLoading = renderScale !== scale;

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            aria-label="previous page"
            variant="ghost"
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currPage - 1));
            }}
            disabled={currPage <= 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              {...register("page")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "NaN"}</span>
            </p>
          </div>

          <Button
            aria-label="next page"
            variant="ghost"
            onClick={() => {
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              );
              setValue("page", String(currPage + 1));
            }}
            disabled={numPages === undefined || currPage === numPages}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          {/* Button to generate quizzes */}
          <Dialog
            open={isOpen}
            onOpenChange={(o) => {
              if (!o) {
                setIsOpen(o);
              }
            }}
          >
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
              <Button className="cursor-pointer">
                <p>Create Quiz</p>

                <Lightbulb color="yellow" fill="yellow" />
              </Button>
            </DialogTrigger>

            {/* DialogTitle is included for accessibility, but hidden visually */}
            <DialogTitle className="sr-only">Generate Quiz</DialogTitle>

            <DialogContent className="max-w-sm p-0">
              <QuizCreation fileId={fileId} />
            </DialogContent>
          </Dialog>

          {/* Button to view quiz history */}
          <Dialog
            open={isHistoryOpen}
            onOpenChange={(o) => {
              if (!o) {
                setIsHistoryOpen(o);
              }
            }}
          >
            <DialogTrigger asChild onClick={() => setIsHistoryOpen(true)}>
              <Button className="cursor-pointer">
                <p>History</p>

                <TimerReset />
              </Button>
            </DialogTrigger>

            {/* DialogTitle is included for accessibility, but hidden visually */}
            <DialogTitle className="sr-only">View history</DialogTitle>

            <DialogContent className="max-w-sm p-0">
              <History fileId={fileId} />
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="zoom" variant="ghost" className="gap-1.5">
                <Search className="h-4 w-4" />
                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(0.6)}>
                60%
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => setScale(0.8)}>
                80%
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => setScale(1.2)}>
                120%
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => setScale(1.4)}>
                140%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            aria-label="rotate 90 degrees"
            variant="ghost"
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast.error("Error loading PDF");
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className="max-h-full"
            >
              {isLoading && renderScale ? (
                <Page
                  pageNumber={currPage}
                  width={width ? width : 1}
                  scale={scale}
                  rotate={rotation}
                  key={"@" + renderScale}
                />
              ) : null}

              <div className="pointer-events-none fixed top-1/2 left-[28%] transform -translate-x-1/2 -translate-y-1/2 flex justify-between w-[51%] z-10">
                <ChevronLeft
                  color="gray"
                  className={cn(
                    "cursor-pointer pointer-events-auto",
                    currPage <= 1 && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => {
                    if (currPage > 1) {
                      setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
                      setValue("page", String(currPage - 1));
                    }
                  }}
                />
                <ChevronRight
                  color="gray"
                  className={cn(
                    "cursor-pointer pointer-events-auto",
                    (numPages === undefined || currPage === numPages) &&
                      "opacity-50 pointer-events-none"
                  )}
                  onClick={() => {
                    if (numPages !== undefined && currPage < numPages) {
                      setCurrPage((prev) =>
                        prev + 1 > numPages! ? numPages! : prev + 1
                      );
                      setValue("page", String(currPage + 1));
                    }
                  }}
                />
              </div>

              <Page
                className={cn(isLoading ? "hidden" : "")}
                key={"@" + scale}
                pageNumber={currPage}
                width={width ? width : 1}
                scale={scale}
                rotate={rotation}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
