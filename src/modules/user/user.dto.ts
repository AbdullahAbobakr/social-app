import z from "zod";
import { logout ,frezzeAccount, restorsAccount, hardDeleteAccount } from "./user.validation";


export type IlogoutDto = z.infer<typeof logout.body>
export type IfreezeAccountDto = z.infer<typeof frezzeAccount.params>
export type IrestoreAccountDto = z.infer<typeof restorsAccount.params>
export type IhardDeleteAccountDto = z.infer<typeof hardDeleteAccount.params>