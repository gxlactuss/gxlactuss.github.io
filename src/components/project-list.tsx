"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useState } from "react";
import { projects } from "@/lib/config";
import { ProjectCard } from "./project-card";
import { ProjectSheet } from "./project-sheet";

export function ProjectList() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const open = projects.find((p) => p.slug === openSlug);
  const close = useCallback(() => setOpenSlug(null), []);

  return (
    <>
      {/* grid-cols-1 is minmax(0, 1fr), which stops the marquee's wide track from stretching the column. */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} onOpen={() => setOpenSlug(project.slug)} />
        ))}
      </div>
      <AnimatePresence>{open && <ProjectSheet key={open.slug} project={open} onClose={close} />}</AnimatePresence>
    </>
  );
}
