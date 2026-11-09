
import Header from "@/components/Header";
import { houseFromRedux } from "@/redux/houseSlice";
import HouseService from "@/services/houseService";
import { format } from "date-fns";
import moment from "moment/moment";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { PatternFormat } from "react-number-format";
import { useRouter } from "next/router";

function Payment() {
  const { data: session } = useSession();
  const router = useRouter();

  const houseDetail = useSelector(houseFromRedux);

  const houseService = new HouseService(session);

  const [selectedDates, setSelectedDates] = useState([]);
  const [isPay, setIsPay] = useState(false);

  // Check whether a date is valid.
  const isValidDate = (value) =>
    value && !Number.isNaN(new Date(value).getTime());

  // Validate the booking information from Redux.
  const hasValidBooking =
    Boolean(houseDetail?.houseId) &&
    isValidDate(houseDetail?.startDate) &&
    isValidDate(houseDetail?.endDate) &&
    new Date(houseDetail.endDate) > new Date(houseDetail.startDate);

  // Format dates only when valid booking information exists.
  const startDate = hasValidBooking
    ? format(new Date(houseDetail.startDate), "dd/MM/yy")
    : "--";

  const endDate = hasValidBooking
    ? format(new Date(houseDetail.endDate), "dd/MM/yy")
    : "--";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Prepare reservation dates, excluding the checkout date.
  useEffect(() => {
    if (!router.isReady) return;

    if (!hasValidBooking) {
      router.replace("/");
      return;
    }

    const datesArray = [];
    let currentDate = moment(houseDetail.startDate);
    const checkoutDate = moment(houseDetail.endDate);

    while (currentDate.isBefore(checkoutDate, "day")) {
      datesArray.push(currentDate.clone().format("YYYY-MM-DD"));
      currentDate.add(1, "day");
    }

    setSelectedDates(datesArray);
  }, [
    router.isReady,
    hasValidBooking,
    houseDetail.startDate,
    houseDetail.endDate,
  ]);

  // Handle reservation submission.
  const onSubmit = async (data) => {
    if (
      !hasValidBooking ||
      !session?.user?.email ||
      selectedDates.length === 0
    ) {
      alert("Booking information is missing. Please select your dates again.");
      return;
    }

    const reserveDto = {
      houseId: houseDetail.houseId,
      datesForReserve: selectedDates,
      tenantEmail: session.user.email,
      day: houseDetail.days,
      totalPrice: houseDetail.totalPrice,
    };

    setIsPay(true);

    try {
      const res = await houseService.reserveHouse(reserveDto);

      if (res.status === 200) {
        router.push("/success");
      } else {
        alert("Reservation failed. Please try again.");
      }
    } catch (error) {
      console.error("Reservation error:", error);
      alert("Reservation failed. Please try again.");
    } finally {
      setIsPay(false);
    }
  };

  // Show a safe message while redirecting if booking data is missing.
  if (!hasValidBooking) {
    return (
      <div>
        <Header />
        <p className="text-center mt-20">
          Booking information is missing. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="">
      <Header />

      <div className="max-w-7xl mx-auto flex justify-between items-center mt-16">
        {/* Image */}
        <div className="hidden sm:inline-block w-1/2 text-center">
          <img src="/payment_bg.png" alt="Payment illustration" />
        </div>

        {/* Payment Section */}
        <div className="w-1/2 p-6">
          <h1 className="uppercase text-center font-bold text-4xl text-teal-600">
            Payments
          </h1>

          <p className="px-5 pt-4 text-lg font-semibold">Total Cost</p>
          <div className="border-b border-gray-300 mr-6 ml-5" />

          <div className="grid grid-cols-2 px-5 py-1 pt-2 text-gray-600">
            <p>City</p>
            <p>{houseDetail.city?.cityName || "--"}</p>
          </div>

          <div className="grid grid-cols-2 px-5 py-1 text-gray-600">
            <p>Days</p>
            <p>{houseDetail.days}</p>
          </div>

          <div className="grid grid-cols-2 px-5 py-1 text-gray-600">
            <p>Days Between</p>
            <p>
              {startDate} - {endDate}
            </p>
          </div>

          <div className="grid grid-cols-2 px-5 py-1 text-gray-600">
            <p>Price</p>
            <p>{houseDetail.totalPrice - 100}₺</p>
          </div>

          <div className="grid grid-cols-2 px-5 py-1 pb-2 text-gray-600">
            <p>Fee</p>
            <p>100₺</p>
          </div>

          <div className="border-b border-gray-300 mr-6 ml-5" />

          <div className="grid grid-cols-2 px-5 py-1 text-lg font-semibold">
            <p>Total Price</p>
            <p>{houseDetail.totalPrice}₺</p>
          </div>

          <h1 className="mt-12 font-semibold text-xl px-5">
            Card Information
          </h1>

          <div className="border-b border-gray-300 mr-6 ml-5" />

          <form
            className="flex flex-col mt-4 px-5 space-y-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col">
              <label className="px-1 text-sm">Full Name</label>

              <input
                {...register("fullName", {
                  required: "Please enter your full name.",
                })}
                className="border border-1 px-2 py-2 rounded-lg bg-gray-100 focus:outline-teal-500 hover:border-teal-500 placeholder:text-sm"
                placeholder="Full Name"
              />

              <p className="text-[#ed6172] font-semibold px-2">
                {errors.fullName?.message}
              </p>
            </div>

            <div className="flex flex-col">
              <label className="px-1 text-sm">Card Number</label>

              <PatternFormat
                required
                format="#### #### #### ####"
                type="input"
                className="cardNum border border-1 px-2 py-2 rounded-lg bg-gray-100 focus:outline-teal-500 hover:border-teal-500 placeholder:text-sm"
                placeholder="**** **** **** ****"
              />
            </div>

            <div className="flex justify-between space-x-2">
              <div className="flex flex-col">
                <label className="px-1 text-sm">Expiration Date</label>

                <PatternFormat
                  format="##/##"
                  type="input"
                  className="border border-1 px-2 py-2 rounded-lg bg-gray-100 focus:outline-teal-500 hover:border-teal-500 placeholder:text-sm"
                  placeholder="10/23"
                />
              </div>

              <div className="flex flex-col">
                <label className="px-1 text-sm">CVV</label>

                <PatternFormat
                  format="###"
                  type="input"
                  className="border border-1 px-2 py-2 rounded-lg bg-gray-100 focus:outline-teal-500 hover:border-teal-500 placeholder:text-sm"
                  placeholder="946"
                />
              </div>
            </div>

            <div className="pt-6 text-center">
              <button
                className="px-8 py-2 bg-teal-500 rounded-2xl shadow-md font-semibold text-white hover:scale-105 active:scale-90 transform transition-all duration-200 ease-in-out disabled:opacity-50"
                type="submit"
                disabled={isPay || selectedDates.length === 0}
              >
                <div className="flex items-center">
                  <span>Pay {houseDetail.totalPrice}₺</span>

                  <div
                    className={`${!isPay ? "hidden" : "inline-block"} pl-3`}
                    role="status"
                  >
                    <svg
                      aria-hidden="true"
                      className="inline w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#ed6172]"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082ZM9.08144 50.5908C9.08144 73.1892 27.4012 91.5092 50 91.5092C72.5987 91.5092 90.9186 73.1892 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50.5908 9.67226C9.08144 9.67226 47.8511 9.54855 51.7195 9.54855 55.5407 10.0491C60.8642 10.7766 65.9928 12.5452 70.6332 15.2552C75.2732 17.9647 79.3349 21.5614 82.5849 25.841C84.9172 28.9121 86.7992 32.2914 88.1811 35.8758C89.083 38.2158 91.5421 39.6787 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8621 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8822 10.7238 75.2122 7.41289C69.5422 4.10158 63.2755 1.94073 56.7698 1.05126C51.7668 0.367541 46.6974 0.446843 41.7345 1.27828C39.2613 1.69373 37.813 4.197 38.4501 6.62326C39.0873 9.04886 41.5691 10.4717 44.0506 10.1071C47.8511 9.54855 51.7195 9.54855 55.5407 10.0491C60.8642 10.7766 65.9928 12.5452 70.6332 15.2552C75.2732 17.9647 79.3349 21.5614 82.5849 25.841C84.9172 28.9121 86.7992 32.2914 88.1811 35.8758C89.083 38.2158 91.5421 39.6787 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>

                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Payment;
