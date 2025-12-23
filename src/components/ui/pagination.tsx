import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
  href?: string
} & Omit<React.ComponentProps<typeof Button>, "href">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  href,
  ...props
}: PaginationLinkProps) => {
  const buttonClasses = cn(
    buttonVariants({
      variant: isActive ? "default" : "ghost",
      size,
    }),
    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
    className
  );

  if (href) {
    // Filtrar apenas props compatíveis com Link (remover props específicas de Button)
    const {
      onClick,
      onCopy,
      onCopyCapture,
      onCut,
      onCutCapture,
      onPaste,
      onPasteCapture,
      type,
      disabled,
      form,
      formAction,
      formEncType,
      formMethod,
      formNoValidate,
      formTarget,
      name,
      value,
      ...linkProps
    } = props;
    return (
      <Link
        href={href}
        className={buttonClasses}
        aria-current={isActive ? "page" : undefined}
        {...(linkProps as Omit<React.ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "aria-current">)}
      />
    );
  }

  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "default" : "ghost"}
      size={size}
      className={cn(
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      {...props}
    />
  );
};
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  href,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    href={href}
    aria-label="Ir para página anterior"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Anterior</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  href,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    href={href}
    aria-label="Ir para próxima página"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Próxima</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Mais páginas</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

