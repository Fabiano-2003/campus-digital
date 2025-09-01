-- Para desenvolvimento: Atualizar configuração para não exigir confirmação de email
-- Esta atualização permite login imediato sem confirmação de email durante o desenvolvimento

-- Verificar configuração atual de auth
SELECT name, setting_value, description 
FROM auth.config 
WHERE name IN ('email_confirm_timeout', 'external_email_enabled', 'enable_signup');

-- Esta consulta é apenas para verificar as configurações atuais
-- A configuração de "Confirm email" deve ser alterada manualmente no painel do Supabase