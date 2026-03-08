# Política de Privacidade

`SegFlow CRM` é um sistema de gestão para corretoras. O projeto não embute analytics ou trackers por padrão, mas processa dados operacionais da aplicação na infraestrutura onde você fizer o deploy.

## Resumo

- dados do CRM são armazenados no banco configurado pela instância do projeto
- autenticação usa cookies `httpOnly` e refresh tokens rotativos
- o frontend consulta a BrasilAPI para preencher endereço por CEP
- quem opera a instância é responsável pelos dados processados no ambiente de produção

## Dados tratados pela aplicação

- dados cadastrais de corretoras, usuários e clientes
- dados de propostas e apólices
- credenciais e artefatos de autenticação necessários para manter a sessão
- logs técnicos e mensagens de erro do ambiente

## Serviços externos

- `BrasilAPI`: consulta de CEP para preenchimento de endereço

O repositório não ativa analytics, pixel de marketing ou coleta de uso por terceiros no app principal.

## Armazenamento e segurança

- os dados persistem no PostgreSQL configurado pela instância
- a autenticação usa JWT e refresh token com rotação
- o backend aplica `helmet`, `cors`, validação de entrada e rate limiting

## Responsabilidade do operador

Se você fizer deploy do `SegFlow CRM`, você passa a ser responsável por retenção, acesso, backup e conformidade legal dos dados processados na sua instância.

## Contato

Para suporte geral, consulte [SUPPORT.md](SUPPORT.md). Para relato de vulnerabilidades, consulte [SECURITY.md](SECURITY.md).
