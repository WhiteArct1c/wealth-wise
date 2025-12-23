"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Home, ChevronRight } from "lucide-react";

// Mapeamento de rotas para labels amigáveis
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  transactions: "Transações",
  accounts: "Contas",
  categories: "Categorias",
  goals: "Metas",
};

export function AppHeader() {
  const pathname = usePathname();

  // Verifica se está em uma página principal ou subpágina
  const getPageInfo = () => {
    const segments = pathname.split("/").filter(Boolean);
    
    // Se tem 0 ou 1 segmento, é página principal
    // Ex: /dashboard ou /transactions são páginas principais
    const isMainPage = segments.length <= 1;
    
    if (isMainPage) {
      // Página principal - retorna apenas o título
      const pageName = segments[0] || "dashboard";
      return {
        showBreadcrumb: false,
        pageTitle: routeLabels[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1),
      };
    }
    
    // Subpágina - gera breadcrumb
    // Ex: /transactions/new ou /transactions/123
    const breadcrumbs = [];
    
    // Adiciona a página principal como primeiro item (clicável)
    const mainPage = segments[0];
    breadcrumbs.push({
      label: routeLabels[mainPage] || mainPage.charAt(0).toUpperCase() + mainPage.slice(1),
      href: `/${mainPage}`,
      isActive: false,
    });
    
    // Adiciona os segmentos restantes (subpáginas)
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      
      // Tenta formatar o label de forma amigável
      let label = segment;
      
      // Se for um ID (apenas números), mostra "Detalhes"
      if (/^\d+$/.test(segment)) {
        label = "Detalhes";
      } else {
        // Formata: "new" -> "Nova", "edit" -> "Editar", etc.
        label = segment
          .replace(/-/g, " ")
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        
        // Traduções comuns
        const translations: Record<string, string> = {
          "New": "Nova",
          "Edit": "Editar",
          "Create": "Criar",
          "Details": "Detalhes",
        };
        
        if (translations[label]) {
          label = translations[label];
        }
      }
      
      // Constrói o caminho completo até este segmento
      let currentPath = "";
      for (let j = 0; j <= i; j++) {
        currentPath += `/${segments[j]}`;
      }
      const fullPath = currentPath;
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : fullPath,
        isActive: isLast,
      });
    }
    
    return {
      showBreadcrumb: true,
      breadcrumbs,
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      <div className="flex flex-1 items-center justify-between gap-4">
        {pageInfo.showBreadcrumb ? (
          /* Breadcrumb para subpáginas */
          <Breadcrumb>
            <BreadcrumbList>
              {pageInfo.breadcrumbs?.map((crumb, index) => (
                <div key={`${crumb.href || crumb.label}-${index}`} className="flex items-center">
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {crumb.isActive ? (
                      <BreadcrumbPage className="font-medium">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={crumb.href || "#"}
                          className="transition-colors hover:text-foreground"
                        >
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          /* Título da página principal */
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Home className="h-5 w-5 text-muted-foreground" />
            {pageInfo.pageTitle}
          </h1>
        )}
      </div>
    </header>
  );
}

