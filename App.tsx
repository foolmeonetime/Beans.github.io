import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Placeholder components - these would be defined in separate files
const ShoppingPage = () => <div>Shopping Page</div>
const InventoryPage = () => <div>Inventory Page</div>
const CookingPage = () => <div>Cooking Page</div>

export default function CulinaryQuest() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')

  const handleLogin = () => {
    // In a real app, this would involve authentication
    setUser({ name: username, points: 0, inventory: [] })
  }

  if (!user) {
    return (
      <Card className="w-[350px] mx-auto mt-20">
        <CardHeader>
          <CardTitle>Welcome to Culinary Quest</CardTitle>
          <CardDescription>Enter a username to start your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin}>Start Quest</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Router>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Culinary Quest</h1>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
            <span>Points: {user.points}</span>
          </div>
        </header>

        <Tabs defaultValue="shopping" className="w-full">
          <TabsList>
            <TabsTrigger value="shopping">
              <Link to="/">Shopping</Link>
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Link to="/inventory">Inventory</Link>
            </TabsTrigger>
            <TabsTrigger value="cooking">
              <Link to="/cooking">Cooking</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <main className="mt-6">
          <Routes>
            <Route path="/" element={<ShoppingPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/cooking" element={<CookingPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
