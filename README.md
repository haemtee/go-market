# go-market

## Back end simple market place

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
{base.api}/v1/user/:id       => delete user by id  // only delete own id base on cookie, or admin roles ```

to be continue
