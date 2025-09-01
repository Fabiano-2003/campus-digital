import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const EmailConfirmation = () => {
  const [resending, setResending] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleResendConfirmation = async () => {
    setResending(true);
    // Aqui poderia implementar reenvio de email se necessário
    setTimeout(() => setResending(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-hero-gradient opacity-5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Confirme seu Email
            </CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para seu email
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Conta criada com sucesso!</strong><br />
                Verifique sua caixa de email e clique no link de confirmação para ativar sua conta.
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Para desenvolvimento/testes:</strong><br />
                Desative "Confirm email" no painel do Supabase para login imediato sem confirmação.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={handleResendConfirmation}
                variant="outline"
                className="w-full"
                disabled={resending}
              >
                {resending ? "Reenviando..." : "Reenviar Email"}
              </Button>
              
              <Button 
                onClick={() => navigate("/auth")}
                className="w-full bg-hero-gradient hover:opacity-90"
              >
                Voltar ao Login
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Não recebeu o email? Verifique a pasta de spam.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailConfirmation;