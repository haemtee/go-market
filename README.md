# go-market

## Back end simple market place

### USER SECTION

```
GET
{base.api}/v1/user/users     => get all user sort by newest user // only admin remove password field
{base.api}/v1/user/:id       => get user by id                   // validate user can access, remove password field
{base.api}/v1/user/logout    => remove cookie return null

POST
{base.api}/v1/user/register  => on success return cookie token jwt id
{base.api}/v1/user/login     => on success return cookie token jwt id

PATCH
{base.api}/v1/user/:id       => edit user by id  // only edit own id base on cookie, cant edit roles or username, admin roles can edit, include roles

DELETE
{base.api}/v1/user/:id       => delete user by id  // only delete own id base on cookie, or admin roles // if deleted id = seller, also delete all his product

```

### PRODUCT SECTION

```
GET
{base.api}/v1/product/products          => get all products  sort  by promoted product and newest product
{base.api}/v1/product/promoted          => get promoted products
{base.api}/v1/product/:id               => get product by id
{base.api}/v1/product/seller/:seller    => get product by seller
{base.api}/v1/product/name/:name        => get product by name


POST
{base.api}/v1/product/add               => add product          // validate roles seller can access

PATCH
{base.api}/v1/product/:id               => edit product by id   // only edit own product, cant edit seller id, admin roles admin can edit, include promoted

DELETE
{base.api}/v1/product/:id               => edit product by id   // only delete own product or roles == admin
```

to be continue
