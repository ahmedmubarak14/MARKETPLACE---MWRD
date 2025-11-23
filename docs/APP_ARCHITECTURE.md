# MWRD B2B Marketplace - Complete Application Documentation

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [User Roles & Permissions](#3-user-roles--permissions)
4. [Authentication Flow](#4-authentication-flow)
5. [Business Process Flow](#5-business-process-flow)
6. [Portal Workflows](#6-portal-workflows)
7. [Data Models](#7-data-models)
8. [State Management](#8-state-management)
9. [Component Hierarchy](#9-component-hierarchy)
10. [API & Services Layer](#10-api--services-layer)

---

## 1. System Overview

MWRD is a B2B (Business-to-Business) marketplace platform that connects **Clients** (buyers) with **Suppliers** (sellers) through a managed procurement process. An **Admin** oversees all operations, approvals, and pricing margins.

### Key Features
- Multi-role authentication (Client, Supplier, Admin)
- Request for Quote (RFQ) management
- Product catalog with approval workflow
- Quote comparison and acceptance
- Order tracking and fulfillment
- Margin-based pricing control
- Export capabilities (CSV, Invoice)

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MWRD B2B MARKETPLACE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        PRESENTATION LAYER                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │   Landing   │  │    Login    │  │   Portals   │  │    UI      │  │    │
│  │  │    Page     │  │    Page     │  │  (3 Types)  │  │ Components │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        APPLICATION LAYER                             │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │   React     │  │  React Hook │  │    Zod      │  │   Custom   │  │    │
│  │  │   Router    │  │    Form     │  │ Validation  │  │   Hooks    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      STATE MANAGEMENT LAYER                          │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    Zustand Store                             │    │    │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐  │    │    │
│  │  │  │  Users  │ │Products │ │  RFQs   │ │ Quotes  │ │Orders │  │    │    │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘  │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                              │                                       │    │
│  │  ┌─────────────┐  ┌─────────────────────┐  ┌───────────────────┐    │    │
│  │  │ToastContext │  │ Session Management  │  │ LocalStorage      │    │    │
│  │  │  (Global)   │  │  (sessionStorage)   │  │ (Persistence)     │    │    │
│  │  └─────────────┘  └─────────────────────┘  └───────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         SERVICES LAYER                               │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │  API        │  │  Auth       │  │  Sanitize   │  │  Export    │  │    │
│  │  │  Service    │  │  Service    │  │  Utils      │  │  Utils     │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                       │
│                                      ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         DATA LAYER (Mock)                            │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                      mockData.ts                             │    │    │
│  │  │   Users │ Products │ RFQs │ Quotes │ Orders                  │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  │                              │                                       │    │
│  │                     [FUTURE: Supabase Backend]                       │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │  PostgreSQL │ Auth │ Real-time │ Storage │ Edge Functions   │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. User Roles & Permissions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER ROLES MATRIX                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐               │
│  │    CLIENT    │      │   SUPPLIER   │      │    ADMIN     │               │
│  │    (Buyer)   │      │   (Seller)   │      │  (Operator)  │               │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘               │
│         │                     │                     │                        │
│         ▼                     ▼                     ▼                        │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐               │
│  │ • Browse     │      │ • Manage     │      │ • Approve    │               │
│  │   Products   │      │   Products   │      │   Products   │               │
│  │ • Create     │      │ • View RFQs  │      │ • Approve    │               │
│  │   RFQs       │      │ • Submit     │      │   Suppliers  │               │
│  │ • Compare    │      │   Quotes     │      │ • Set        │               │
│  │   Quotes     │      │ • Manage     │      │   Margins    │               │
│  │ • Accept     │      │   Orders     │      │ • Review     │               │
│  │   Orders     │      │ • Track      │      │   Quotes     │               │
│  │ • Download   │      │   Shipments  │      │ • Manage     │               │
│  │   Invoices   │      │              │      │   Users      │               │
│  │ • Export CSV │      │              │      │ • Analytics  │               │
│  └──────────────┘      └──────────────┘      └──────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Permission Details

| Action | Client | Supplier | Admin |
|--------|--------|----------|-------|
| Browse Products | ✅ | ✅ | ✅ |
| Create Products | ❌ | ✅ | ❌ |
| Approve Products | ❌ | ❌ | ✅ |
| Create RFQ | ✅ | ❌ | ❌ |
| View RFQs | Own Only | Anonymized | All |
| Submit Quote | ❌ | ✅ | ❌ |
| Set Margins | ❌ | ❌ | ✅ |
| Accept Quote | ✅ | ❌ | ❌ |
| Manage Orders | Own Only | Own Only | All |
| User Management | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ✅ |

---

## 4. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────┐                                                               │
│   │  User   │                                                               │
│   └────┬────┘                                                               │
│        │                                                                     │
│        ▼                                                                     │
│   ┌─────────────────┐                                                       │
│   │  Landing Page   │                                                       │
│   │  (Public)       │                                                       │
│   └────────┬────────┘                                                       │
│            │                                                                 │
│            ▼                                                                 │
│   ┌─────────────────┐     ┌──────────────────┐                              │
│   │   Login Page    │────▶│  Check Lockout   │                              │
│   │                 │     │  (5 attempts =   │                              │
│   │  • Email        │     │   15 min lock)   │                              │
│   │  • Password     │     └────────┬─────────┘                              │
│   └─────────────────┘              │                                        │
│                                    ▼                                        │
│                         ┌──────────────────┐                                │
│                         │ Validate Creds   │                                │
│                         │ (Zod Schema)     │                                │
│                         └────────┬─────────┘                                │
│                                  │                                          │
│                    ┌─────────────┴─────────────┐                            │
│                    ▼                           ▼                            │
│           ┌──────────────┐           ┌──────────────┐                       │
│           │   SUCCESS    │           │   FAILURE    │                       │
│           └──────┬───────┘           └──────┬───────┘                       │
│                  │                          │                               │
│                  ▼                          ▼                               │
│         ┌────────────────┐         ┌────────────────┐                       │
│         │ Create Session │         │ Record Failed  │                       │
│         │ (30 min TTL)   │         │ Attempt        │                       │
│         │                │         │ (Max 5)        │                       │
│         │ • sessionId    │         └────────────────┘                       │
│         │ • userId       │                                                  │
│         │ • expiresAt    │                                                  │
│         │ • lastActivity │                                                  │
│         └───────┬────────┘                                                  │
│                 │                                                           │
│                 ▼                                                           │
│         ┌────────────────┐                                                  │
│         │ Route by Role  │                                                  │
│         └───────┬────────┘                                                  │
│                 │                                                           │
│     ┌───────────┼───────────┐                                               │
│     ▼           ▼           ▼                                               │
│ ┌────────┐ ┌────────┐ ┌────────┐                                           │
│ │ Client │ │Supplier│ │ Admin  │                                           │
│ │ Portal │ │ Portal │ │ Portal │                                           │
│ └────────┘ └────────┘ └────────┘                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                        SESSION TIMEOUT FLOW

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│   │  User Activity  │────▶│ Update Session  │────▶│ Reset 30 min    │       │
│   │  (mouse, key,   │     │ lastActivity    │     │ Timer           │       │
│   │   scroll, touch)│     │ (throttled 30s) │     │                 │       │
│   └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                                                              │
│   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐       │
│   │  25 min passed  │────▶│ Show Warning    │────▶│ "Session expires│       │
│   │  (5 min left)   │     │ Modal           │     │  in 5 minutes"  │       │
│   └─────────────────┘     └─────────────────┘     └─────────────────┘       │
│                                    │                                        │
│                    ┌───────────────┴───────────────┐                        │
│                    ▼                               ▼                        │
│           ┌──────────────┐               ┌──────────────┐                   │
│           │ Click "Stay  │               │ No Action /  │                   │
│           │ Logged In"   │               │ Timeout      │                   │
│           └──────┬───────┘               └──────┬───────┘                   │
│                  │                              │                           │
│                  ▼                              ▼                           │
│         ┌────────────────┐             ┌────────────────┐                   │
│         │ Extend Session │             │ Clear Session  │                   │
│         │ +30 minutes    │             │ Redirect Login │                   │
│         └────────────────┘             └────────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Business Process Flow

### Complete RFQ-to-Order Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RFQ → QUOTE → ORDER LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CLIENT                    ADMIN                    SUPPLIER                 │
│    │                         │                         │                     │
│    ▼                         │                         │                     │
│ ┌──────────────┐             │                         │                     │
│ │ 1. BROWSE    │             │                         │                     │
│ │    PRODUCTS  │             │                         │                     │
│ │              │             │                         │                     │
│ │ • View       │             │                         │                     │
│ │   catalog    │             │                         │                     │
│ │ • Filter by  │             │                         │                     │
│ │   category   │             │                         │                     │
│ │ • Select     │             │                         │                     │
│ │   items      │             │                         │                     │
│ └──────┬───────┘             │                         │                     │
│        │                     │                         │                     │
│        ▼                     │                         │                     │
│ ┌──────────────┐             │                         │                     │
│ │ 2. CREATE    │             │                         │                     │
│ │    RFQ       │             │                         │                     │
│ │              │             │                         │                     │
│ │ • Add items  │             │                         │                     │
│ │ • Set qty    │             │                         │                     │
│ │ • Add notes  │             │                         │                     │
│ │ • Submit     │             │                         │                     │
│ └──────┬───────┘             │                         │                     │
│        │                     │                         │                     │
│        │    RFQ Created      │                         │                     │
│        │    (Status: OPEN)   │                         │                     │
│        │─────────────────────┼────────────────────────▶│                     │
│        │                     │                         │                     │
│        │                     │                         ▼                     │
│        │                     │                  ┌──────────────┐             │
│        │                     │                  │ 3. VIEW RFQ  │             │
│        │                     │                  │   (Anonymized)│            │
│        │                     │                  │              │             │
│        │                     │                  │ • See items  │             │
│        │                     │                  │ • See qty    │             │
│        │                     │                  │ • NO client  │             │
│        │                     │                  │   identity   │             │
│        │                     │                  └──────┬───────┘             │
│        │                     │                         │                     │
│        │                     │                         ▼                     │
│        │                     │                  ┌──────────────┐             │
│        │                     │                  │ 4. SUBMIT    │             │
│        │                     │                  │    QUOTE     │             │
│        │                     │                  │              │             │
│        │                     │                  │ • Set price  │             │
│        │                     │                  │   (supplier  │             │
│        │                     │                  │    cost)     │             │
│        │                     │                  │ • Lead time  │             │
│        │                     │                  │ • Notes      │             │
│        │                     │                  └──────┬───────┘             │
│        │                     │                         │                     │
│        │                     │      Quote Submitted    │                     │
│        │                     │◀───(Status: PENDING_ADMIN)──────────────────  │
│        │                     │                         │                     │
│        │                     ▼                         │                     │
│        │              ┌──────────────┐                 │                     │
│        │              │ 5. REVIEW    │                 │                     │
│        │              │    QUOTE     │                 │                     │
│        │              │              │                 │                     │
│        │              │ • See        │                 │                     │
│        │              │   supplier   │                 │                     │
│        │              │   price      │                 │                     │
│        │              │ • Set margin │                 │                     │
│        │              │   % (0-100)  │                 │                     │
│        │              │ • Calculate  │                 │                     │
│        │              │   final      │                 │                     │
│        │              │   price      │                 │                     │
│        │              │ • Approve    │                 │                     │
│        │              └──────┬───────┘                 │                     │
│        │                     │                         │                     │
│        │    Quote Approved   │                         │                     │
│        │◀─(Status: SENT_TO_CLIENT)                     │                     │
│        │                     │                         │                     │
│        ▼                     │                         │                     │
│ ┌──────────────┐             │                         │                     │
│ │ 6. COMPARE   │             │                         │                     │
│ │    QUOTES    │             │                         │                     │
│ │              │             │                         │                     │
│ │ • See final  │             │                         │                     │
│ │   prices     │             │                         │                     │
│ │   (with      │             │                         │                     │
│ │   margin)    │             │                         │                     │
│ │ • Lead times │             │                         │                     │
│ │ • Compare    │             │                         │                     │
│ │   suppliers  │             │                         │                     │
│ │   (anon)     │             │                         │                     │
│ └──────┬───────┘             │                         │                     │
│        │                     │                         │                     │
│        ▼                     │                         │                     │
│ ┌──────────────┐             │                         │                     │
│ │ 7. ACCEPT    │             │                         │                     │
│ │    QUOTE     │             │                         │                     │
│ │              │             │                         │                     │
│ │ • Choose     │             │                         │                     │
│ │   best quote │             │                         │                     │
│ │ • Confirm    │             │                         │                     │
│ └──────┬───────┘             │                         │                     │
│        │                     │                         │                     │
│        │ Quote Accepted ─────┼────────────────────────▶│                     │
│        │(Status: ACCEPTED)   │                         │                     │
│        │                     │                         │                     │
│        │              ORDER CREATED                    │                     │
│        │◀────────────────────┼────────────────────────▶│                     │
│        │                     │                         │                     │
│        ▼                     ▼                         ▼                     │
│ ┌──────────────┐      ┌──────────────┐         ┌──────────────┐             │
│ │ 8. TRACK     │      │ 8. MANAGE    │         │ 8. FULFILL   │             │
│ │    ORDER     │      │    LOGISTICS │         │    ORDER     │             │
│ │              │      │              │         │              │             │
│ │ • View       │      │ • Overview   │         │ • Process    │             │
│ │   status     │      │ • Track all  │         │ • Ship       │             │
│ │ • Download   │      │   orders     │         │ • Update     │             │
│ │   invoice    │      │ • Update     │         │   status     │             │
│ │              │      │   status     │         │              │             │
│ └──────────────┘      └──────────────┘         └──────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pricing Flow Detail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRICING MODEL                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   SUPPLIER SETS              ADMIN ADDS               CLIENT SEES            │
│   ────────────               ──────────               ───────────            │
│                                                                              │
│   ┌─────────────┐      ┌─────────────────┐      ┌─────────────────┐         │
│   │ Supplier    │      │ Margin %        │      │ Final Price     │         │
│   │ Price       │  +   │ (0-100%)        │  =   │                 │         │
│   │             │      │                 │      │                 │         │
│   │ $1,000      │      │ 15%             │      │ $1,150          │         │
│   └─────────────┘      └─────────────────┘      └─────────────────┘         │
│                                                                              │
│   FORMULA:  Final Price = Supplier Price × (1 + Margin%)                    │
│                                                                              │
│   VISIBILITY:                                                                │
│   • Supplier sees: Own price only                                           │
│   • Admin sees: Supplier price + Margin + Final price                       │
│   • Client sees: Final price only                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Portal Workflows

### Client Portal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT PORTAL WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                           SIDEBAR                                    │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│   │  │Dashboard│ │ Browse  │ │  RFQs   │ │ Orders  │ │Settings │       │   │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│   └───────┼──────────┼──────────┼──────────┼──────────┼─────────────────┘   │
│           │          │          │          │          │                      │
│           ▼          │          │          │          │                      │
│   ┌──────────────┐   │          │          │          │                      │
│   │  DASHBOARD   │   │          │          │          │                      │
│   │              │   │          │          │          │                      │
│   │ • Active RFQs│   │          │          │          │                      │
│   │ • Pending    │   │          │          │          │                      │
│   │   Quotes     │   │          │          │          │                      │
│   │ • Recent     │   │          │          │          │                      │
│   │   Orders     │   │          │          │          │                      │
│   │ • Quick      │   │          │          │          │                      │
│   │   Actions    │   │          │          │          │                      │
│   └──────────────┘   │          │          │          │                      │
│                      ▼          │          │          │                      │
│              ┌──────────────┐   │          │          │                      │
│              │BROWSE ITEMS  │   │          │          │                      │
│              │              │   │          │          │                      │
│              │ • Product    │   │          │          │                      │
│              │   Grid       │   │          │          │                      │
│              │ • Category   │   │          │          │                      │
│              │   Filter     │   │          │          │                      │
│              │ • Search     │   │          │          │                      │
│              │ • Add to RFQ │   │          │          │                      │
│              │   Cart       │   │          │          │                      │
│              └──────┬───────┘   │          │          │                      │
│                     │           │          │          │                      │
│                     └──────────▶│          │          │                      │
│                                 ▼          │          │                      │
│                         ┌──────────────┐   │          │                      │
│                         │    RFQs      │   │          │                      │
│                         │              │   │          │                      │
│                         │ • View Cart  │   │          │                      │
│                         │ • Set Qty    │   │          │                      │
│                         │ • Add Notes  │   │          │                      │
│                         │ • Submit RFQ │   │          │                      │
│                         │ • View       │   │          │                      │
│                         │   History    │   │          │                      │
│                         │ • Compare    │   │          │                      │
│                         │   Quotes     │   │          │                      │
│                         │ • Accept     │   │          │                      │
│                         │   Quote      │   │          │                      │
│                         │ • Export CSV │   │          │                      │
│                         └──────┬───────┘   │          │                      │
│                                │           │          │                      │
│                                └──────────▶│          │                      │
│                                            ▼          │                      │
│                                    ┌──────────────┐   │                      │
│                                    │   ORDERS     │   │                      │
│                                    │              │   │                      │
│                                    │ • Order List │   │                      │
│                                    │ • Status     │   │                      │
│                                    │   Tracking   │   │                      │
│                                    │ • Download   │   │                      │
│                                    │   Invoice    │   │                      │
│                                    │ • View       │   │                      │
│                                    │   Details    │   │                      │
│                                    └──────────────┘   │                      │
│                                                       ▼                      │
│                                               ┌──────────────┐               │
│                                               │  SETTINGS    │               │
│                                               │              │               │
│                                               │ • Profile    │               │
│                                               │ • Company    │               │
│                                               │   Info       │               │
│                                               │ • Password   │               │
│                                               └──────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Supplier Portal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUPPLIER PORTAL WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                           SIDEBAR                                    │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│   │  │Dashboard│ │Products │ │  RFQs   │ │ Quote   │ │ Orders  │       │   │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│   └───────┼──────────┼──────────┼──────────┼──────────┼─────────────────┘   │
│           │          │          │          │          │                      │
│           ▼          │          │          │          │                      │
│   ┌──────────────┐   │          │          │          │                      │
│   │  DASHBOARD   │   │          │          │          │                      │
│   │              │   │          │          │          │                      │
│   │ • Open RFQs  │   │          │          │          │                      │
│   │ • Submitted  │   │          │          │          │                      │
│   │   Quotes     │   │          │          │          │                      │
│   │ • Active     │   │          │          │          │                      │
│   │   Orders     │   │          │          │          │                      │
│   │ • Pending    │   │          │          │          │                      │
│   │   Approvals  │   │          │          │          │                      │
│   └──────────────┘   │          │          │          │                      │
│                      ▼          │          │          │                      │
│              ┌──────────────┐   │          │          │                      │
│              │  PRODUCTS    │   │          │          │                      │
│              │              │   │          │          │                      │
│              │ ┌──────────┐ │   │          │          │                      │
│              │ │ Add New  │ │   │          │          │                      │
│              │ │ Product  │ │   │          │          │                      │
│              │ │          │ │   │          │          │                      │
│              │ │ • Name   │ │   │          │          │                      │
│              │ │ • Desc   │ │   │          │          │                      │
│              │ │ • Price  │ │   │          │          │                      │
│              │ │ • Cat    │ │   │          │          │                      │
│              │ │ • Image  │ │   │          │          │                      │
│              │ └──────────┘ │   │          │          │                      │
│              │              │   │          │          │                      │
│              │ Product List │   │          │          │                      │
│              │ ┌──────────┐ │   │          │          │                      │
│              │ │ PENDING  │◀┼───┼──────────┼──────────┼─ Awaiting Admin     │
│              │ │ APPROVED │ │   │          │          │                      │
│              │ │ REJECTED │ │   │          │          │                      │
│              │ └──────────┘ │   │          │          │                      │
│              └──────────────┘   │          │          │                      │
│                                 ▼          │          │                      │
│                         ┌──────────────┐   │          │                      │
│                         │RECEIVED RFQs │   │          │                      │
│                         │              │   │          │                      │
│                         │ • Anonymized │   │          │                      │
│                         │   Client     │   │          │                      │
│                         │ • Item List  │   │          │                      │
│                         │ • Quantities │   │          │                      │
│                         │ • Deadline   │   │          │                      │
│                         └──────┬───────┘   │          │                      │
│                                │           │          │                      │
│                                └──────────▶│          │                      │
│                                            ▼          │                      │
│                                    ┌──────────────┐   │                      │
│                                    │ SEND QUOTE   │   │                      │
│                                    │              │   │                      │
│                                    │ • Select RFQ │   │                      │
│                                    │ • Set Price  │   │                      │
│                                    │   (Supplier  │   │                      │
│                                    │    Cost)     │   │                      │
│                                    │ • Lead Time  │   │                      │
│                                    │ • Submit     │   │                      │
│                                    │              │   │                      │
│                                    │ Quote goes   │   │                      │
│                                    │ to Admin ────┼───┼▶ PENDING_ADMIN      │
│                                    └──────────────┘   │                      │
│                                                       ▼                      │
│                                               ┌──────────────┐               │
│                                               │   ORDERS     │               │
│                                               │              │               │
│                                               │ • Won Orders │               │
│                                               │ • Status:    │               │
│                                               │   - Pending  │               │
│                                               │   - Processing│              │
│                                               │   - Shipped  │               │
│                                               │   - Delivered│               │
│                                               │ • Update     │               │
│                                               │   Status     │               │
│                                               └──────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Admin Portal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN PORTAL WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                           SIDEBAR                                    │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│   │  │Overview │ │Approvals│ │ Quotes  │ │Logistics│ │  Users  │       │   │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│   └───────┼──────────┼──────────┼──────────┼──────────┼─────────────────┘   │
│           │          │          │          │          │                      │
│           ▼          │          │          │          │                      │
│   ┌──────────────────────┐     │          │          │                      │
│   │      OVERVIEW        │     │          │          │                      │
│   │                      │     │          │          │                      │
│   │ ┌──────────────────┐ │     │          │          │                      │
│   │ │   CHARTS         │ │     │          │          │                      │
│   │ │ • Sales Trend    │ │     │          │          │                      │
│   │ │ • Margin %       │ │     │          │          │                      │
│   │ │ • Order Volume   │ │     │          │          │                      │
│   │ │ • Revenue        │ │     │          │          │                      │
│   │ └──────────────────┘ │     │          │          │                      │
│   │                      │     │          │          │                      │
│   │ ┌──────────────────┐ │     │          │          │                      │
│   │ │  QUICK ACTIONS   │ │     │          │          │                      │
│   │ │ • Pending        │─┼────▶│          │          │                      │
│   │ │   Products       │ │     │          │          │                      │
│   │ │ • Review Quotes  │─┼─────┼─────────▶│          │                      │
│   │ │ • User Requests  │─┼─────┼──────────┼─────────▶│                      │
│   │ └──────────────────┘ │     │          │          │                      │
│   └──────────────────────┘     │          │          │                      │
│                                ▼          │          │                      │
│                        ┌──────────────┐   │          │                      │
│                        │  APPROVALS   │   │          │                      │
│                        │              │   │          │                      │
│                        │ Product Queue│   │          │                      │
│                        │ ┌──────────┐ │   │          │                      │
│                        │ │ Product  │ │   │          │                      │
│                        │ │ Details  │ │   │          │                      │
│                        │ │          │ │   │          │                      │
│                        │ │[Approve] │ │   │          │                      │
│                        │ │[Reject]  │ │   │          │                      │
│                        │ └──────────┘ │   │          │                      │
│                        └──────────────┘   │          │                      │
│                                           ▼          │                      │
│                                   ┌──────────────┐   │                      │
│                                   │QUOTE MANAGER │   │                      │
│                                   │              │   │                      │
│                                   │ ┌──────────┐ │   │                      │
│                                   │ │ Global   │ │   │                      │
│                                   │ │ Margin % │ │   │                      │
│                                   │ │ Setting  │ │   │                      │
│                                   │ └──────────┘ │   │                      │
│                                   │              │   │                      │
│                                   │ Quote List:  │   │                      │
│                                   │ ┌──────────┐ │   │                      │
│                                   │ │ Supplier │ │   │                      │
│                                   │ │ Price    │ │   │                      │
│                                   │ │          │ │   │                      │
│                                   │ │ + Margin │ │   │                      │
│                                   │ │ ────────│ │   │                      │
│                                   │ │ = Final │ │   │                      │
│                                   │ │          │ │   │                      │
│                                   │ │[Approve] │ │   │                      │
│                                   │ │[Reject]  │ │   │                      │
│                                   │ └──────────┘ │   │                      │
│                                   └──────────────┘   │                      │
│                                                      ▼                      │
│                                              ┌──────────────┐               │
│                                              │  LOGISTICS   │               │
│                                              │              │               │
│                                              │ All Orders:  │               │
│                                              │ • Pending    │               │
│                                              │ • Processing │               │
│                                              │ • Shipped    │               │
│                                              │ • Delivered  │               │
│                                              │              │               │
│                                              │ [Update      │               │
│                                              │  Status]     │               │
│                                              └──────────────┘               │
│                                                      │                      │
│                                                      ▼                      │
│                                              ┌──────────────┐               │
│                                              │    USERS     │               │
│                                              │              │               │
│                                              │ SUPPLIERS:   │               │
│                                              │ • KYC Review │               │
│                                              │ • Approve    │               │
│                                              │ • Reject     │               │
│                                              │ • Deactivate │               │
│                                              │              │               │
│                                              │ CLIENTS:     │               │
│                                              │ • View List  │               │
│                                              │ • Status     │               │
│                                              │ • Deactivate │               │
│                                              └──────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Data Models

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ENTITY RELATIONSHIP DIAGRAM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────┐                          ┌─────────────────┐          │
│   │      USER       │                          │    PRODUCT      │          │
│   ├─────────────────┤                          ├─────────────────┤          │
│   │ id: string      │                          │ id: string      │          │
│   │ name: string    │                          │ supplierId: FK  │──────┐   │
│   │ email: string   │                          │ name: string    │      │   │
│   │ role: UserRole  │◀─────────────────────────│ description     │      │   │
│   │ companyName     │         creates          │ category        │      │   │
│   │ verified        │                          │ image: string   │      │   │
│   │ status          │                          │ status: enum    │      │   │
│   │ kycStatus       │                          │ costPrice       │      │   │
│   │ dateJoined      │                          │ sku: string     │      │   │
│   │ rating          │                          └─────────────────┘      │   │
│   └────────┬────────┘                                   │               │   │
│            │                                            │               │   │
│            │ creates                                    │ referenced    │   │
│            │ (CLIENT)                                   │ in            │   │
│            ▼                                            ▼               │   │
│   ┌─────────────────┐      contains       ┌─────────────────┐          │   │
│   │       RFQ       │─────────────────────│    RFQ_ITEM     │          │   │
│   ├─────────────────┤                     ├─────────────────┤          │   │
│   │ id: string      │                     │ productId: FK   │──────────┘   │
│   │ clientId: FK    │                     │ quantity: number│              │
│   │ items: RFQItem[]│                     │ notes: string   │              │
│   │ status: enum    │                     └─────────────────┘              │
│   │ date: string    │                                                      │
│   │ createdAt       │                                                      │
│   │ deadline        │                                                      │
│   └────────┬────────┘                                                      │
│            │                                                               │
│            │ receives                                                      │
│            ▼                                                               │
│   ┌─────────────────┐                                                      │
│   │      QUOTE      │                                                      │
│   ├─────────────────┤                                                      │
│   │ id: string      │                          ┌─────────────────┐         │
│   │ rfqId: FK       │                          │     ORDER       │         │
│   │ supplierId: FK  │──────────────────────────├─────────────────┤         │
│   │ supplierPrice   │        creates           │ id: string      │         │
│   │ leadTime        │        (on accept)       │ quoteId: FK     │         │
│   │ marginPercent   │─────────────────────────▶│ clientId: FK    │         │
│   │ finalPrice      │                          │ supplierId: FK  │         │
│   │ status: enum    │                          │ amount: number  │         │
│   └─────────────────┘                          │ status: enum    │         │
│                                                │ date: string    │         │
│                                                └─────────────────┘         │
│                                                                             │
│   STATUS ENUMS:                                                             │
│   ─────────────                                                             │
│   UserRole: GUEST | CLIENT | SUPPLIER | ADMIN                               │
│   UserStatus: APPROVED | PENDING | REJECTED | ACTIVE | DEACTIVATED         │
│   KYCStatus: VERIFIED | IN_REVIEW | REJECTED | INCOMPLETE                  │
│   ProductStatus: PENDING | APPROVED | REJECTED                              │
│   RFQStatus: OPEN | QUOTED | CLOSED                                         │
│   QuoteStatus: PENDING_ADMIN | SENT_TO_CLIENT | ACCEPTED | REJECTED        │
│   OrderStatus: PENDING | PROCESSING | SHIPPED | DELIVERED                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. State Management

### Zustand Store Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ZUSTAND STORE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         useStore (Zustand)                          │   │
│   │                    with localStorage persistence                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│            ┌─────────────────────────┼─────────────────────────┐            │
│            │                         │                         │            │
│            ▼                         ▼                         ▼            │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐    │
│   │     STATE       │      │    ACTIONS      │      │   PERSISTENCE   │    │
│   └────────┬────────┘      └────────┬────────┘      └────────┬────────┘    │
│            │                        │                        │              │
│            ▼                        ▼                        ▼              │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐    │
│   │ • currentUser   │      │ AUTH:           │      │ localStorage    │    │
│   │ • isAuthenticated│     │ • login()       │      │ key:            │    │
│   │ • users[]       │      │ • logout()      │      │ 'mwrd-storage'  │    │
│   │ • products[]    │      │ • checkSession()│      │                 │    │
│   │ • rfqs[]        │      │                 │      │ Persists:       │    │
│   │ • quotes[]      │      │ PRODUCTS:       │      │ • users         │    │
│   │ • orders[]      │      │ • addProduct()  │      │ • products      │    │
│   │                 │      │ • updateProduct()│     │ • rfqs          │    │
│   │                 │      │ • deleteProduct()│     │ • quotes        │    │
│   │                 │      │ • approveProduct()│    │ • orders        │    │
│   │                 │      │ • rejectProduct()│     │ • currentUser   │    │
│   │                 │      │                 │      │                 │    │
│   │                 │      │ RFQS:           │      │ Session:        │    │
│   │                 │      │ • addRFQ()      │      │ sessionStorage  │    │
│   │                 │      │ • updateRFQ()   │      │ (separate)      │    │
│   │                 │      │                 │      │                 │    │
│   │                 │      │ QUOTES:         │      │                 │    │
│   │                 │      │ • addQuote()    │      │                 │    │
│   │                 │      │ • updateQuote() │      │                 │    │
│   │                 │      │ • approveQuote()│      │                 │    │
│   │                 │      │ • acceptQuote() │      │                 │    │
│   │                 │      │ • rejectQuote() │      │                 │    │
│   │                 │      │                 │      │                 │    │
│   │                 │      │ ORDERS:         │      │                 │    │
│   │                 │      │ • addOrder()    │      │                 │    │
│   │                 │      │ • updateOrder() │      │                 │    │
│   │                 │      │                 │      │                 │    │
│   │                 │      │ USERS:          │      │                 │    │
│   │                 │      │ • updateUser()  │      │                 │    │
│   │                 │      │ • approveSupplier()│   │                 │    │
│   │                 │      │ • rejectSupplier()│    │                 │    │
│   └─────────────────┘      └─────────────────┘      └─────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    USER ACTION          COMPONENT            STORE             STORAGE       │
│    ───────────          ─────────            ─────             ───────       │
│                                                                              │
│   ┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────┐     │
│   │  Click   │──────▶│  Form    │──────▶│  Action  │──────▶│ localStorage│  │
│   │  Button  │       │ Handler  │       │ Dispatch │       │   Update   │   │
│   └──────────┘       └──────────┘       └──────────┘       └──────────┘     │
│                                                │                            │
│                                                ▼                            │
│                                         ┌──────────┐                        │
│                                         │  State   │                        │
│                                         │  Update  │                        │
│                                         └────┬─────┘                        │
│                                              │                              │
│                            ┌─────────────────┼─────────────────┐            │
│                            ▼                 ▼                 ▼            │
│                     ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│                     │Component │      │Component │      │Component │        │
│                     │    A     │      │    B     │      │    C     │        │
│                     │ Re-render│      │ Re-render│      │ Re-render│        │
│                     └──────────┘      └──────────┘      └──────────┘        │
│                                                                              │
│   EXAMPLE: Submit Quote Flow                                                 │
│   ─────────────────────────                                                  │
│                                                                              │
│   Supplier fills      SupplierPortal      addQuote()      quotes[] updated  │
│   quote form    ────▶  validates    ────▶  called   ────▶ localStorage      │
│                        with Zod                            persisted        │
│                                                │                            │
│                                                ▼                            │
│                                         Admin Portal                        │
│                                         shows new quote                     │
│                                         in PENDING_ADMIN                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT HIERARCHY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   App.tsx                                                                    │
│   │                                                                          │
│   ├── ToastProvider (Context)                                               │
│   │   │                                                                      │
│   │   └── ErrorBoundary                                                     │
│   │       │                                                                  │
│   │       ├── SessionTimeoutWarning                                         │
│   │       │                                                                  │
│   │       └── [Route Rendering]                                             │
│   │           │                                                              │
│   │           ├── Landing.tsx ─────────────────────── (Public)              │
│   │           │                                                              │
│   │           ├── Login.tsx ───────────────────────── (Public)              │
│   │           │   └── Form (react-hook-form + Zod)                          │
│   │           │                                                              │
│   │           └── ProtectedRoute ──────────────────── (Auth Required)       │
│   │               │                                                          │
│   │               ├── ClientPortal.tsx ────────────── (Role: CLIENT)        │
│   │               │   ├── Sidebar                                            │
│   │               │   ├── Dashboard Tab                                      │
│   │               │   ├── Browse Items Tab                                   │
│   │               │   ├── RFQs Tab                                           │
│   │               │   ├── Orders Tab                                         │
│   │               │   └── Settings Tab                                       │
│   │               │                                                          │
│   │               ├── SupplierPortal.tsx ──────────── (Role: SUPPLIER)      │
│   │               │   ├── Sidebar                                            │
│   │               │   ├── Dashboard Tab                                      │
│   │               │   ├── Products Tab                                       │
│   │               │   ├── RFQs Tab                                           │
│   │               │   ├── Quote Tab                                          │
│   │               │   └── Orders Tab                                         │
│   │               │                                                          │
│   │               └── AdminPortal.tsx ─────────────── (Role: ADMIN)         │
│   │                   ├── Sidebar                                            │
│   │                   ├── Overview Tab (Charts)                              │
│   │                   ├── Approvals Tab                                      │
│   │                   ├── Quote Manager Tab                                  │
│   │                   ├── Logistics Tab                                      │
│   │                   └── Users Tab                                          │
│   │                                                                          │
│   └── ToastContainer (renders toasts)                                       │
│                                                                              │
│   SHARED COMPONENTS:                                                         │
│   ─────────────────                                                          │
│                                                                              │
│   /components/ui/                                                            │
│   ├── Button.tsx         (primary, secondary, danger, success, outline)     │
│   ├── Input.tsx          (labeled input with error state)                   │
│   ├── Card.tsx           (Card, CardHeader, CardContent, CardFooter)        │
│   ├── Modal.tsx          (sm, md, lg, xl sizes)                             │
│   ├── Toast.tsx          (success, error, warning, info)                    │
│   └── LoadingSpinner.tsx (sm, md, lg sizes)                                 │
│                                                                              │
│   /components/                                                               │
│   ├── Sidebar.tsx        (role-based navigation)                            │
│   ├── ProtectedRoute.tsx (auth + role guard)                                │
│   ├── ConfirmDialog.tsx  (danger, warning, info variants)                   │
│   ├── ErrorBoundary.tsx  (error catching)                                   │
│   └── SessionTimeoutWarning.tsx (5-min warning modal)                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. API & Services Layer

### Current Mock Services

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICES ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        /services/api.ts                              │   │
│   │                     (Singleton Pattern)                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  ApiService.getInstance()                                            │   │
│   │                                                                      │   │
│   │  Methods:                                                            │   │
│   │  ├── login(email, password)     → Promise<User>                     │   │
│   │  ├── logout()                   → Promise<void>                     │   │
│   │  ├── getProducts()              → Promise<Product[]>                │   │
│   │  ├── createProduct(data)        → Promise<Product>                  │   │
│   │  ├── getRFQs()                  → Promise<RFQ[]>                    │   │
│   │  ├── createRFQ(data)            → Promise<RFQ>                      │   │
│   │  ├── getQuotes()                → Promise<Quote[]>                  │   │
│   │  └── createQuote(data)          → Promise<Quote>                    │   │
│   │                                                                      │   │
│   │  Implementation: Mock with 300ms delay                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        /lib/auth.ts                                  │   │
│   │                   (Session Management)                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Session Functions:                                                  │   │
│   │  ├── createSession(userId)      → Session object in sessionStorage  │   │
│   │  ├── getSession()               → Session | null                    │   │
│   │  ├── updateSessionActivity()    → Extends session TTL               │   │
│   │  ├── clearSession()             → Removes session                   │   │
│   │  ├── isSessionValid()           → boolean                           │   │
│   │  └── getSessionTimeRemaining()  → number (ms)                       │   │
│   │                                                                      │   │
│   │  Login Security:                                                     │   │
│   │  ├── recordLoginAttempt(email)  → Tracks failed attempts            │   │
│   │  ├── isAccountLocked(email)     → boolean (15 min lockout)          │   │
│   │  └── getRemainingAttempts()     → number (max 5)                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     /lib/exportUtils.ts                              │   │
│   │                    (Export Functionality)                            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Export Functions:                                                   │   │
│   │  ├── arrayToCSV(data, columns)  → CSV string                        │   │
│   │  ├── downloadFile(content, name, type) → Triggers download          │   │
│   │  ├── exportToCSV(data, columns, filename) → Downloads CSV           │   │
│   │  ├── generateInvoice(order)     → Invoice text                      │   │
│   │  └── downloadInvoice(order)     → Downloads .txt invoice            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      /lib/sanitize.ts                                │   │
│   │                    (Security Utilities)                              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Sanitization Functions:                                             │   │
│   │  ├── escapeHtml(str)            → XSS prevention                    │   │
│   │  ├── sanitizeText(str)          → Safe display text                 │   │
│   │  ├── sanitizeUrl(url)           → URL validation                    │   │
│   │  ├── sanitizeEmail(email)       → Email normalization               │   │
│   │  ├── sanitizeFilename(name)     → Path traversal prevention         │   │
│   │  ├── sanitizeNumber(value)      → Numeric validation                │   │
│   │  └── sanitizeObject(obj)        → Recursive sanitization            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     /lib/validations.ts                              │   │
│   │                      (Zod Schemas)                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Validation Schemas:                                                 │   │
│   │  ├── LoginSchema                → email, password                   │   │
│   │  ├── RegisterSchema             → name, email, password, company    │   │
│   │  ├── ProductSchema              → name, desc, category, price       │   │
│   │  ├── RFQSchema                  → items with qty (1-100,000)        │   │
│   │  ├── QuoteSchema                → price, lead time                  │   │
│   │  └── AdminQuoteReviewSchema     → margin (0-100%)                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Future Backend (Supabase)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FUTURE: SUPABASE INTEGRATION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         SUPABASE                                     │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                      PostgreSQL                                │  │   │
│   │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │   │
│   │  │  │  users  │ │products │ │  rfqs   │ │ quotes  │ │ orders  │  │  │   │
│   │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                        Auth                                    │  │   │
│   │  │  • Email/Password      • Magic Link      • OAuth (Google)     │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                     Real-time                                  │  │   │
│   │  │  • Quote notifications    • Order status updates              │  │   │
│   │  │  • New RFQ alerts         • Chat messages                     │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                      Storage                                   │  │   │
│   │  │  • Product images      • KYC documents     • Invoices         │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                   Edge Functions                               │  │   │
│   │  │  • Email notifications    • PDF generation   • Webhooks       │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │              Row Level Security (RLS)                          │  │   │
│   │  │  • Clients see own RFQs/orders only                           │  │   │
│   │  │  • Suppliers see assigned quotes only                         │  │   │
│   │  │  • Admin sees everything                                       │  │   │
│   │  │  • Cost prices hidden from clients                            │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### File Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── Sidebar.tsx         # Navigation
│   ├── ProtectedRoute.tsx  # Auth guard
│   └── ...
├── contexts/
│   └── ToastContext.tsx    # Global notifications
├── hooks/
│   ├── useSessionTimeout.ts
│   └── useToast.ts
├── lib/
│   ├── auth.ts             # Session management
│   ├── config.ts           # App configuration
│   ├── exportUtils.ts      # CSV/Invoice export
│   ├── sanitize.ts         # Security utilities
│   └── validations.ts      # Zod schemas
├── pages/
│   ├── admin/
│   │   └── AdminPortal.tsx
│   ├── client/
│   │   └── ClientPortal.tsx
│   ├── supplier/
│   │   └── SupplierPortal.tsx
│   ├── Landing.tsx
│   └── Login.tsx
├── services/
│   ├── api.ts              # API service
│   └── mockData.ts         # Demo data
├── store/
│   └── useStore.ts         # Zustand store
├── types/
│   └── types.ts            # TypeScript types
├── utils/
│   └── helpers.ts          # Utility functions
└── App.tsx                 # Root component
```

### Key URLs (Demo)
- Landing: `/`
- Login: `/login`
- Client Portal: `/client`
- Supplier Portal: `/supplier`
- Admin Portal: `/admin`

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mwrd.com | admin123 |
| Client | client@acme.com | client123 |
| Supplier | supplier@techcorp.com | supplier123 |

---

*Document generated for MWRD B2B Marketplace v1.0*
*Last updated: November 2024*
