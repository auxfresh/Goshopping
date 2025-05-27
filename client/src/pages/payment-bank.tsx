import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ArrowLeft, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentBankPage() {
  const { toast } = useToast();

  const bankDetails = {
    bankName: "First National Bank",
    accountName: "Your Store Name Ltd",
    accountNumber: "1234567890",
    routingNumber: "123456789",
    swiftCode: "FBNBUS33",
    reference: `ORDER-${Date.now()}`
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Building className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Bank Transfer Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Payment Instructions</h3>
              <p className="text-sm text-blue-700">
                Please transfer the total amount to the bank account below. 
                Your order will be processed once payment is confirmed (usually within 1-2 business days).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Bank Account Details</h3>
              
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Bank Name</div>
                    <div className="font-medium">{bankDetails.bankName}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank Name")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Account Name</div>
                    <div className="font-medium">{bankDetails.accountName}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account Name")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Account Number</div>
                    <div className="font-medium">{bankDetails.accountNumber}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account Number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Routing Number</div>
                    <div className="font-medium">{bankDetails.routingNumber}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.routingNumber, "Routing Number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <div className="text-sm text-yellow-800">Payment Reference (Important!)</div>
                    <div className="font-medium text-yellow-900">{bankDetails.reference}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.reference, "Payment Reference")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Include the payment reference in your transfer description</li>
                <li>• Keep your transfer receipt for records</li>
                <li>• Contact support if payment is not confirmed within 3 business days</li>
                <li>• Ensure the transferred amount matches your order total exactly</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.href = "/"}
                className="bg-green-600 hover:bg-green-700"
              >
                I've Made the Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}