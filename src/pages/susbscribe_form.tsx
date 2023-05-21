import React from "react";

const SubscribeForm: React.FC = () => (
  <>
    <br />
    <hr className="mx-auto my-4 w-1/4 bg-gray-400 text-left" />
    <div className="mx-auto mb-8 max-w-4xl pr-4 pt-4 text-center text-xl">
      <b>
        Want to get a daily Kiwi Editor&apos;s Pick delivered to your inbox?
        <br />
        Subscribe to KiwiNews!
      </b>
      <br />
      <br />
      <form
        action="https://buttondown.email/api/emails/embed-subscribe/kiwinews"
        method="post"
        target="popupwindow"
        onSubmit={() =>
          window.open("https://buttondown.email/kiwinews", "popupwindow")
        }
        className="mx-auto flex max-w-xl items-center"
      >
        <input
          placeholder="your email"
          type="email"
          name="email"
          id="bd-email"
          className="box-border w-2/3 border-2 border-black p-1"
        />
        <input
          type="submit"
          value="Subscribe"
          className="box-border w-1/3 cursor-pointer border-2 border-black bg-gray-100 p-1 text-base"
        />
      </form>
    </div>
  </>
);

export default SubscribeForm;
