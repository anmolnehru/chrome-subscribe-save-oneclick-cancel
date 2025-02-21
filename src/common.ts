import { getCancelQueue } from './sessionStorage';

export const ONECLICK_CANCEL_ATTRIBUTE = 'data-oneclick-cancel';

export async function processCancelQueue(itemCancelButtonButtonBySubscriptionId: Map<string, HTMLButtonElement>) {
    if (itemCancelButtonButtonBySubscriptionId.size === 0) {
        return;
    }

    const cancelQueue = await getCancelQueue();

    if (cancelQueue.length === 0) {
        return;
    }

    // Retrieve already canceled subscriptions to avoid duplicate processing
    const canceledSubscriptions = JSON.parse(sessionStorage.getItem("canceledSubscriptions") || "[]");

    for (const subscriptionId of cancelQueue) {
        if (canceledSubscriptions.includes(subscriptionId)) {
            continue; // Skip already canceled subscriptions
        }

        const cancelButton = itemCancelButtonButtonBySubscriptionId.get(subscriptionId);

        if (!cancelButton) {
            continue;
        }

        console.log(`Cancelling subscription: ${subscriptionId}`);
        cancelButton.click();

        // Wait for cancellation confirmation button to appear
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const confirmButton = document.querySelector<HTMLButtonElement>(
            'button[data-test-id="confirmCancellation"]'
        );

        if (confirmButton) {
            confirmButton.click();
            console.log(`Confirmed cancellation for: ${subscriptionId}`);

            // Save progress
            canceledSubscriptions.push(subscriptionId);
            sessionStorage.setItem("canceledSubscriptions", JSON.stringify(canceledSubscriptions));

            // Wait for Amazon to process cancellation
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Redirect back to subscriptions page to trigger the next cancellation
            window.location.href = "https://www.amazon.com/hz/mycd/myx#/home/settings/";
            return; // Stop execution here; reload will trigger next cancellation
        } else {
            console.error("Confirm button not found!");
        }
    }

    console.log("All subscriptions have been canceled.");
    alert("All subscriptions have been canceled!");
    sessionStorage.removeItem("canceledSubscriptions");
}
