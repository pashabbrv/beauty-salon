import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Wifi } from 'lucide-react';
import { apiService } from '@/services/api';

const ApiConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      const services = await apiService.getServices();
      setResult(services);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="w-5 h-5" />
          API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test API Connection'
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <Badge variant="outline" className="text-green-600">
                Connection Successful
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Found {Array.isArray(result) ? result.length : 0} services
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <Badge variant="destructive">
                Connection Failed
              </Badge>
            </div>
            <div className="text-sm text-red-600">
              {error}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiConnectionTest;