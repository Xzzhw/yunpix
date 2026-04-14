import ACCESS_ENUM from "./accessEnum";
//检查用户权限

const checkAccess = (loginuser, needAccess = ACCESS_ENUM.NOT_LOGIN):boolean =>
{
  const LoginUserAccess = loginuser.userRole ?? ACCESS_ENUM.NOT_LOGIN
  if (needAccess === ACCESS_ENUM.NOT_LOGIN) {
    return true
  }
  if (needAccess === ACCESS_ENUM.USER) {
    if (LoginUserAccess === ACCESS_ENUM.NOT_LOGIN) {
      return false
    }
  }
  if (needAccess === ACCESS_ENUM.ADMIN) {
    if (LoginUserAccess != ACCESS_ENUM.ADMIN) {
      return false
    }

  }
  return true
}
export default checkAccess;
