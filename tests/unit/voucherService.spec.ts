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

	it("should create a new voucher", async () => {
		const voucher = {
			code: "123456",
			discount: 50,
			used: false,
		};

		jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockResolvedValueOnce(undefined);

		const newVoucher = jest
			.spyOn(voucherRepository, "createVoucher")
			.mockResolvedValueOnce({
				...voucher,
				id: 1,
			});

		await voucherService.createVoucher("123456", 50);
		expect(newVoucher).toBeCalled();
	});
});

describe("applyVoucher unit tests", () => {
	it("should respond with error if there is no voucher with given code", () => {
		expect(async () => {
			const code = "validCode";
			jest
				.spyOn(voucherRepository, "getVoucherByCode")
				.mockResolvedValueOnce(undefined);

			await voucherService.applyVoucher(code, 50);
		}).rejects.toEqual({
			type: "conflict",
			message: "Voucher does not exist.",
		});
	});

	it("should doesnt apply discount, when voucher has already been used", async () => {
		const amount = 200;
		const usedVoucher = {
			id: 1,
			code: "validCode",
			discount: 50,
			used: true,
		};

		jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockResolvedValueOnce(usedVoucher);

		const result = await voucherService.applyVoucher(usedVoucher.code, amount);

		expect(result).toEqual({
			amount,
			discount: usedVoucher.discount,
			finalAmount: amount,
			applied: false,
		});
	});

	it("should doesnt apply discount, when amount is below 100", async () => {
		const amount = 99;
		const validVoucher = {
			id: 1,
			code: "validCode",
			discount: 50,
			used: false,
		};

		jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockResolvedValueOnce(validVoucher);

		const result = await voucherService.applyVoucher(validVoucher.code, amount);

		expect(result).toEqual({
			amount,
			discount: validVoucher.discount,
			finalAmount: amount,
			applied: false,
		});
	});

	it("should apply discount, when voucher isnt used and amount is equal to 100", async () => {
		const amount = 100;
		const validVoucher = {
			id: 1,
			code: "validCode",
			discount: 50,
			used: false,
		};

		jest
			.spyOn(voucherRepository, "getVoucherByCode")
			.mockResolvedValueOnce(validVoucher);

		jest
			.spyOn(voucherRepository, "useVoucher")
			.mockResolvedValueOnce({ ...validVoucher, used: true });

		const result = await voucherService.applyVoucher(validVoucher.code, amount);

		expect(result).toEqual({
			amount,
			discount: validVoucher.discount,
			finalAmount: amount - amount * (validVoucher.discount / 100),
			applied: true,
		});
	});
});
