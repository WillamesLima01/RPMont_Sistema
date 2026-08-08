# RPMont Sistema — Gestão de Atendimentos Equinos

Sistema Full Stack desenvolvido para gerenciamento completo dos atendimentos, cuidados, histórico e atividades dos equinos da RPMont, integrando frontend, backend, banco de dados PostgreSQL, persistência com Hibernate/JPA e ambiente containerizado com Docker.

O projeto foi construído com foco em regras de negócio reais, organização das informações, rastreabilidade do histórico dos animais, integração entre camadas e preparação para implantação em servidor na nuvem.

---

## Tecnologias utilizadas

### Backend

- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven
- API REST

### Frontend

- React
- JavaScript
- HTML
- CSS

### Banco de Dados

- PostgreSQL
- Spring Data JPA
- Hibernate

### Containers e Infraestrutura

- Docker
- Containers
- PostgreSQL em container
- Padronização do ambiente de execução
- Preparação para deploy em servidor na nuvem

### Ferramentas

- Git
- GitHub
- IntelliJ IDEA
- VS Code
- DBeaver
- Insomnia

---

## Principais funcionalidades

O sistema foi desenvolvido para centralizar e organizar o gerenciamento completo dos atendimentos, cuidados, histórico e atividades relacionados aos equinos da RPMont.

Entre as funcionalidades implementadas estão:

### Cadastro e gerenciamento de equinos

- cadastro de equinos;
- atualização dos dados cadastrais;
- consulta detalhada das informações dos animais;
- organização do histórico individual de cada equino;
- recuperação e consulta de informações por meio de filtros.

### Consultas e atendimentos

- controle de consultas;
- registro de atendimentos;
- acompanhamento do histórico de atendimentos;
- armazenamento de informações relacionadas aos procedimentos realizados;
- atualização e manutenção do histórico clínico e operacional do animal.

### Controle de medicamentos

- cadastro e controle de medicamentos;
- registro dos medicamentos utilizados nos atendimentos;
- acompanhamento das informações relacionadas à administração de medicamentos;
- manutenção do histórico de utilização de medicamentos por equino.

### Vacinação

- controle de vacinação;
- registro das vacinas aplicadas;
- acompanhamento do histórico vacinal;
- consulta das informações de vacinação de cada animal.

### Ferrageamento

- controle de ferrageamento;
- registro dos ferrageamentos realizados;
- acompanhamento do histórico de ferrageamento;
- manutenção das informações relacionadas aos procedimentos realizados em cada equino.

### Jornada de trabalho dos equinos

- controle da jornada de trabalho dos animais;
- registro das atividades realizadas;
- acompanhamento da utilização dos equinos;
- organização do histórico de atividades e jornadas;
- consulta das informações relacionadas ao trabalho realizado por cada animal.

### Resenha descritiva

- cadastro e gerenciamento da resenha descritiva dos equinos;
- armazenamento das características individuais do animal;
- manutenção das informações utilizadas para identificação e acompanhamento;
- consulta das informações descritivas de cada equino.

### Histórico e rastreabilidade

- centralização das informações do animal;
- manutenção de histórico individual;
- acompanhamento de atendimentos;
- acompanhamento de medicamentos;
- acompanhamento de vacinação;
- acompanhamento de ferrageamento;
- acompanhamento das jornadas de trabalho;
- recuperação das informações armazenadas no banco de dados.

### Integração do sistema

- integração entre frontend e backend;
- comunicação através de API REST;
- persistência de dados em banco relacional PostgreSQL;
- implementação das regras de negócio no backend;
- utilização de Spring Data JPA e Hibernate;
- organização das responsabilidades entre frontend, backend e banco de dados.

---

## Backend

O backend foi desenvolvido utilizando Java e Spring Boot.

A aplicação é responsável pela implementação das regras de negócio e pela comunicação entre o frontend e o banco de dados.

Entre as responsabilidades do backend estão:

- criação e disponibilização de endpoints REST;
- recebimento e validação de requisições;
- implementação das regras de negócio;
- processamento das operações da aplicação;
- gerenciamento das entidades do sistema;
- persistência de dados;
- consultas ao banco de dados;
- atualização dos registros;
- comunicação com PostgreSQL;
- organização da camada de acesso aos dados.

A persistência utiliza Spring Data JPA e Hibernate para realizar o mapeamento objeto-relacional entre as entidades Java e as tabelas do banco de dados.

---

## Frontend

O frontend foi desenvolvido utilizando React.

A aplicação cliente é responsável pela interação do usuário com o sistema e pela comunicação com o backend.

Entre suas responsabilidades estão:

- exibição das informações;
- navegação entre as funcionalidades;
- formulários de cadastro;
- edição de registros;
- consultas;
- filtros;
- apresentação do histórico dos animais;
- consumo dos endpoints disponibilizados pelo backend;
- envio e recebimento de informações através da API REST.

---

## Banco de Dados

O sistema utiliza PostgreSQL como banco de dados relacional.

O banco é responsável pelo armazenamento das informações relacionadas aos equinos e às diferentes áreas de acompanhamento do sistema.

Entre os dados armazenados estão:

- equinos;
- informações cadastrais;
- atendimentos;
- consultas;
- medicamentos;
- registros relacionados aos tratamentos;
- vacinação;
- ferrageamentos;
- jornadas de trabalho;
- atividades realizadas;
- resenhas descritivas;
- histórico dos animais;
- demais informações relacionadas ao gerenciamento dos equinos.

A camada de persistência utiliza:

- Spring Data JPA;
- Hibernate;
- entidades Java;
- relacionamentos entre entidades;
- mapeamento objeto-relacional;
- consultas;
- persistência de dados;
- operações de atualização;
- recuperação de informações.

---

## Persistência com JPA e Hibernate

A aplicação utiliza Spring Data JPA e Hibernate para realizar a comunicação entre a camada de domínio e o PostgreSQL.

Entre os conceitos aplicados estão:

- mapeamento objeto-relacional;
- entidades JPA;
- relacionamentos entre entidades;
- persistência de objetos;
- consultas;
- atualização de registros;
- recuperação de dados;
- abstração da camada de acesso ao banco.

Essa abordagem permite organizar a persistência de forma integrada à arquitetura da aplicação e reduzir o acoplamento entre as regras de negócio e as operações diretamente relacionadas ao banco de dados.

---

## API REST

A comunicação entre frontend e backend ocorre por meio de uma API REST desenvolvida com Spring Boot.

A API é responsável por disponibilizar as operações necessárias para o funcionamento do sistema.

Fluxo simplificado:

```text
Usuário
  |
  v
React
  |
  v
HTTP / JSON
  |
  v
API REST
  |
  v
Spring Boot
  |
  v
JPA / Hibernate
  |
  v
PostgreSQL
```

A separação entre frontend e backend permite que as regras de negócio fiquem concentradas no servidor e que o frontend seja responsável principalmente pela interface e interação com o usuário.

---

## Docker e Containers

O projeto utiliza Docker para containerização dos serviços e padronização do ambiente de execução.

O PostgreSQL é executado em container, permitindo maior isolamento e portabilidade do ambiente.

Entre os benefícios da utilização de containers estão:

- padronização do ambiente de desenvolvimento;
- isolamento dos serviços;
- facilidade de configuração;
- portabilidade;
- redução de diferenças entre ambientes;
- preparação para implantação em servidor;
- simplificação da infraestrutura necessária para deploy.

Fluxo simplificado:

```text
Frontend React
      |
      v
   REST API
      |
      v
Spring Boot
      |
      v
Hibernate / JPA
      |
      v
PostgreSQL
      |
      v
Docker / Containers
      |
      v
Servidor em Nuvem
```

---

## Arquitetura

O projeto é organizado em frontend e backend separados.

```text
RPMont_Sistema
│
├── gerenciador-equinos-api
│   └── Backend Java / Spring Boot
│
└── rpmont-web
    └── Frontend React
```

A comunicação entre as aplicações ocorre através de uma API REST.

```text
React
  |
  v
REST API
  |
  v
Spring Boot
  |
  v
Hibernate / JPA
  |
  v
PostgreSQL
  |
  v
Docker
```

Essa separação possibilita maior organização do código e independência entre as diferentes camadas da aplicação.

---

## Organização do projeto

### Backend

`gerenciador-equinos-api`

Responsável por:

- regras de negócio;
- endpoints REST;
- processamento das requisições;
- persistência de dados;
- entidades;
- relacionamentos;
- consultas;
- integração com PostgreSQL;
- operações de cadastro;
- operações de consulta;
- operações de atualização;
- gerenciamento do histórico das informações.

### Frontend

`rpmont-web`

Responsável por:

- interface da aplicação;
- navegação;
- formulários;
- consultas;
- filtros;
- exibição das informações;
- atualização dos dados;
- apresentação do histórico dos equinos;
- consumo da API REST.

---

## Áreas de controle do sistema

O RPMont Sistema concentra diferentes áreas relacionadas ao acompanhamento dos equinos.

```text
Equino
  |
  |-- Dados cadastrais
  |
  |-- Resenha descritiva
  |
  |-- Consultas
  |
  |-- Atendimentos
  |
  |-- Medicamentos
  |
  |-- Vacinação
  |
  |-- Ferrageamento
  |
  |-- Jornada de trabalho
  |
  |-- Histórico
```

Essa organização permite manter as informações relacionadas ao animal de forma centralizada e facilitar o acompanhamento ao longo do tempo.

---

## Jornada de trabalho

O sistema possui funcionalidades relacionadas ao registro e acompanhamento da jornada de trabalho dos equinos.

Esse módulo permite organizar informações relacionadas à utilização dos animais nas atividades realizadas pela unidade.

Entre as informações controladas estão:

- identificação do equino;
- atividades realizadas;
- registros de utilização;
- acompanhamento da jornada;
- histórico das atividades.

O objetivo é melhorar a rastreabilidade da utilização dos equinos e manter um histórico organizado das atividades desenvolvidas.

---

## Controle de saúde e cuidados

O sistema concentra diferentes informações relacionadas à saúde e aos cuidados com os equinos.

Entre os módulos relacionados estão:

- consultas;
- atendimentos;
- medicamentos;
- vacinação;
- ferrageamento;
- histórico individual.

A centralização dessas informações permite acompanhar o histórico de cada animal dentro da aplicação.

---

## Resenha descritiva

A aplicação possui controle da resenha descritiva dos equinos.

Essa funcionalidade permite manter registradas informações características de cada animal, auxiliando na identificação e organização dos dados.

As informações da resenha ficam associadas ao cadastro do equino e fazem parte do histórico individual mantido pelo sistema.

---

## Deploy e ambiente em nuvem

A arquitetura do projeto está preparada para implantação em servidor na nuvem.

A utilização de Docker permite transportar o ambiente de execução de forma mais previsível entre desenvolvimento e produção.

Entre os objetivos da containerização estão:

- padronização do ambiente;
- redução de diferenças entre desenvolvimento e produção;
- isolamento dos serviços;
- facilidade de configuração;
- portabilidade;
- simplificação do processo de deploy;
- preparação para infraestrutura em servidor remoto.

A estratégia permite que os componentes da aplicação sejam executados em ambiente de servidor utilizando containers.

---

## Conceitos aplicados

Durante o desenvolvimento do projeto são aplicados conhecimentos relacionados a:

- desenvolvimento Full Stack;
- Java;
- Spring Boot;
- React;
- JavaScript;
- HTML;
- CSS;
- APIs REST;
- HTTP;
- JSON;
- orientação a objetos;
- banco de dados relacional;
- PostgreSQL;
- modelagem de dados;
- Spring Data JPA;
- Hibernate;
- mapeamento objeto-relacional;
- Docker;
- containers;
- deploy em servidor;
- preparação para ambiente em nuvem;
- integração frontend/backend;
- Git;
- GitHub;
- debugging;
- resolução de problemas;
- arquitetura de aplicações web;
- organização de regras de negócio.

---

## Objetivo do projeto

O projeto tem como objetivo desenvolver uma solução Full Stack para gerenciamento e acompanhamento das informações relacionadas aos equinos da RPMont.

A aplicação busca centralizar informações que anteriormente poderiam estar distribuídas em diferentes registros, permitindo manter um histórico organizado de cada animal.

O projeto também permite aplicar conceitos relacionados a:

- desenvolvimento frontend;
- desenvolvimento backend;
- banco de dados;
- APIs REST;
- persistência;
- modelagem de dados;
- arquitetura de software;
- containers;
- infraestrutura;
- preparação para implantação em servidor na nuvem.

---

## Status do projeto

Projeto funcional e integrante do portfólio de desenvolvimento Full Stack.

A aplicação permanece em evolução contínua, com possibilidade de implementação de novas funcionalidades, melhorias de interface, regras de negócio e infraestrutura.

---

## Autor

**Willames Pereira de Lima**

Desenvolvedor Full Stack

GitHub: [WillamesLima01](https://github.com/WillamesLima01)
