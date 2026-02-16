
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the dashboard
        page.goto("http://localhost:3000/index.html")

        # Check if title exists
        page.wait_for_selector('h1:has-text("Incidentes de Seguridad - Colombia")')

        # Check if map container exists
        page.wait_for_selector('#map')

        # Take a screenshot
        page.screenshot(path="verification/dashboard_verification.png")
        print("Screenshot saved to verification/dashboard_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
