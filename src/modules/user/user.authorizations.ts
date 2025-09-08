import { roleEnum } from "../../DB/models/user.model";

export const endpoint = {
    profile:[roleEnum.user , roleEnum.admin],
    restore:[roleEnum.admin],
    hardDelete:[roleEnum.admin]
}
