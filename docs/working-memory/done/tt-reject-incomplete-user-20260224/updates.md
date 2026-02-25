# Updates: tt-reject-incomplete-user-20260224

## Progress

- Added check in getAuthUserById: return null when both display_name and username are empty. Incomplete users now get 401 and are redirected to login.
