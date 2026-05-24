# Day 3

Go to https://class.hypertheory-labs.com - log in, connect to your VM

**Tell me if you have any issues getting in to your VMs**

## Summary of yesterday

[Summary](./summary-day-2.md)

Questions?

## Today

We are going to build a full feature. "Software Center" [See Requirements](./software-center.md)

> This is the API we build in the Web API 100 course - for now we will use Mock Service Workers

### Big Picture

Employees can get a catalog of currently supported software items by calling `/catalog`

Managers of the Software Center can add approved vendors.

Employees of the Software Center can add catalog items, but most be for an approved vendor.

### Design Spring

### Topics

We will use a combination of tools for API access. This is to give you multiple examples - not that you should use all the tools here in any one project, necessarily.

- `httpResource` (read-only, signal based, uses `HttpClient` behind the scenes)
- `fetch()` - built in browser API
- `HttpClient` - services with Observables
