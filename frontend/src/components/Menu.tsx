'use client'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { usePathname } from "next/navigation"

const menuItemClass = (isActive: boolean) => `
  px-4 py-2 rounded-md
  text-md font-medium
  transition-colors
  hover:bg-gray-100
  focus:bg-gray-100
  focus:outline-none
  ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}
  cursor-pointer
  hover:shadow-inner
`

export default function Menu() {
    const pathname = usePathname();
    
    return (
        <NavigationMenu className="bg-white shadow-sm rounded-lg">
          <NavigationMenuList className="flex space-x-1 p-1">
            <NavigationMenuItem>
                <NavigationMenuLink href="/" className={menuItemClass(pathname === '/')}>
                  Sales
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink href="/products" className={menuItemClass(pathname === '/products')}>
                  Products
                </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
    )
}