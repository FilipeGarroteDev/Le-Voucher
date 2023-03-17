import { jest } from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";

describe("createVoucher unit tests", () => {
	// it("should respond with error if discount is below 1", async () => {
	//   const discount = 0;

	// });

	// it("should respond with error if discount is more than 100", async () => {
	//   const discount = 101;

	// });

	it("should respond with error if exists another voucher with given code", () => {
		expect(async () => {
			const code = "existentCode";
			jest
				.spyOn(voucherRepository, "getVoucherByCode")
				.mockImplementationOnce((): any => {
					return {
						id: 1,
						code,
						discount: 50,
						used: false,
					};
				});
        
			await voucherService.createVoucher(code, 50);
		}).rejects.toEqual({
			type: "conflict",
			message: "Voucher already exist.",
		});
	});

	// it();

	// it();

	// it();
});
