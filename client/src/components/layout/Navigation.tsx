import { Link, useLocation } from "wouter";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [location] = useLocation();
  
  // Define navigation items
  const navItems = [
    { name: "Services", path: "/services" },
    { name: "Bookings", path: "/bookings" },
    { name: "Messages", path: "/messaging" },
    { name: "Message Tools", path: "/message-tools" },
    { name: "AI Chat", path: "/ai-chat" },
    { name: "Settings", path: "/settings" }
  ];
  
  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/services" && location === "/") return true;
    return location === path;
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-primary font-bold text-xl cursor-pointer">BookMe</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex items-center">
            <nav className="flex space-x-8" aria-label="Tabs">
              {navItems.map((item) => (
                <Link key={item.name} href={item.path}>
                  <span 
                    className={`border-b-2 px-1 pb-4 pt-4 font-medium cursor-pointer ${
                      isActive(item.path)
                        ? "border-primary text-primary"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-neutral-500" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5 text-neutral-500" />
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="sm:hidden border-b border-neutral-200 mb-4">
          <nav className="-mb-px flex space-x-6 overflow-x-auto pb-1" aria-label="Tabs">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <span 
                  className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer ${
                    isActive(item.path)
                      ? "border-primary text-primary"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
