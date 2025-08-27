import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LinkType } from "./Navbar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Home,
  Folder,
  BookOpen,
  Video,
  ListMusic,
  FileText,
  Library,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

interface SidebarProps {
  links: LinkType[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar = ({ links, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith("/study-cards");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Map icons to link names
  const getIconForLink = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Home: <Home className="w-5 h-5" />,
      Collections: <Folder className="w-5 h-5" />,
      Learn: <BookOpen className="w-5 h-5" />,
      videos: <Video className="w-5 h-5" />,
      playlists: <ListMusic className="w-5 h-5" />,
      Notes: <FileText className="w-5 h-5" />,
      "My Texts": <FileText className="w-5 h-5" />,
      Library: <Library className="w-5 h-5" />,
      "word article": <BookMarked className="w-5 h-5" />,
    };

    return iconMap[name] || <Home className="w-5 h-5" />;
  };

  const SidebarContent = (
    <div
      className={cn(
        "flex flex-col h-screen bg-[#F9F9F9] border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[240px]",
        isMobile && "w-full"
      )}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-8">
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        <div className="space-y-1">
          {links?.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#ebe7f8] text-[#5a3aa5]"
                    : "text-gray-600 hover:bg-gray-100",
                  isCollapsed && "justify-center px-2"
                )}
                to={link.path}
              >
                {getIconForLink(link.name)}
                {!isCollapsed && link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (hideLayout) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && SidebarContent}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-[240px]">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default Sidebar;
