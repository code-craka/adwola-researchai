import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TestCardInfo() {
  return (
    <Card className="bg-black/50 border border-white/10 backdrop-blur-sm mt-6">
      <CardHeader>
        <CardTitle className="text-white">Test Card Information</CardTitle>
        <CardDescription className="text-gray-400">Use these test cards to try out the payment form</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Card Number</TableHead>
              <TableHead className="text-gray-300">Expiry</TableHead>
              <TableHead className="text-gray-300">CVC</TableHead>
              <TableHead className="text-gray-300">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-white">4242 4242 4242 4242</TableCell>
              <TableCell className="text-white">Any future date</TableCell>
              <TableCell className="text-white">Any 3 digits</TableCell>
              <TableCell className="text-green-400">Success</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-white">4000 0000 0000 0002</TableCell>
              <TableCell className="text-white">Any future date</TableCell>
              <TableCell className="text-white">Any 3 digits</TableCell>
              <TableCell className="text-red-400">Card declined</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-white">4000 0000 0000 3220</TableCell>
              <TableCell className="text-white">Any future date</TableCell>
              <TableCell className="text-white">Any 3 digits</TableCell>
              <TableCell className="text-yellow-400">3D Secure</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}