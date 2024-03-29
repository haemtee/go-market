# go-market

## Back end simple market place

### USER SECTION

```
GET
{base.api}/v1/user/users     => get all user sort by newest user // only admin remove password field
{base.api}/v1/user/:id       => get user by id                   // validate user can access,
                                remove password field
{base.api}/v1/user/          => get logged in user
{base.api}/v1/user/logout    => remove cookie return null

POST
{base.api}/v1/user/register  => on success return cookie token jwt id
{base.api}/v1/user/login     => on success return cookie token jwt id

PATCH
{base.api}/v1/user/:id       => edit user by id  // only edit own id base on cookie,
                                cant edit roles or username, admin roles can edit, include roles

DELETE
{base.api}/v1/user/:id       => delete user by id  // only delete own id base on cookie,
                                or admin roles // if deleted id = seller, also delete all his product

```

### PRODUCT SECTION

```
GET
{base.api}/v1/product/products          => get all products  sort  by promoted product and newest product
{base.api}/v1/product/promoted          => get promoted products
{base.api}/v1/product/:id               => get product by id
{base.api}/v1/product/seller/:id        => get product by seller
{base.api}/v1/product/name/:name        => get product by name


POST
{base.api}/v1/product/add               => add product          // validate roles seller can access

PATCH
{base.api}/v1/product/:id               => edit product by id   // only edit own product, cant edit seller id,
                                           admin roles admin can edit, include promoted

DELETE
{base.api}/v1/product/:id               => edit product by id   // only delete own product or roles == admin
```

### CART SECTION

```
GET
{base.api}/v1/cart/:id    => get cart by id user (buyer) or admin

POST
{base.api}/v1/cart/:id    => add cart by id user (buyer), if cart exist, edit product,
                             if product quantity = 0, remove product
                             example { product_id : ObjectId, quantity : 1 }

DELETE
{base.api}/v1/cart/:id    => delete cart by id buyer
```

### ORDER SECTION

```
GET
{base.api}/v1/order/:id         => get order by order id, owner or admin only
{base.api}/v1/order/            => get all order by id from cookies
                                   if roles = admin,  get all orders


POST
{base.api}/v1/order/seller/:id  => add order by id user (seller)

PATCH
{base.api}/v1/order/:id         => edit status order by id, owner if seller status = sending,
                                   if buyer (status = received / cancel), if seller (status = sending / cancel) or admin only

```

to be continue
