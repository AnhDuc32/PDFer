"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) {
          setIsOpen(o);
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      {/* DialogTitle is included for accessibility, but hidden visually */}
      <DialogTitle className="sr-only">Upload PDF</DialogTitle>

      <DialogContent>Example content</DialogContent>
    </Dialog>
  );
};

export default UploadButton;
