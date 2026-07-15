/* Shared behavior for the My Test Portal login replica.
 *
 * Navigation model (mirrors the real Angular site):
 *   - The chooser (login.html) and the role-switcher links set a one-time
 *     access token in sessionStorage, THEN let the browser follow the link.
 *   - Each portal page runs an inline guard in its <head> that reads and
 *     immediately clears that token. If the token matches the portal's role
 *     the page renders; otherwise it redirects back to the chooser.
 *
 * Result: clicking a button reaches the portal, but navigating to a portal
 * URL directly (or reloading one) bounces back to the chooser -- exactly
 * like the live site, where a direct hit on /login/user lands on /login.
 */
(function () {
    'use strict';

    var ACCESS_KEY = 'zbPortalAccess';

    // Any element with [data-role] grants access to that role's portal when
    // clicked, then navigation proceeds normally via the anchor's href.
    document.addEventListener('click', function (event) {
        var link = event.target.closest('[data-role]');
        if (link) {
            try {
                sessionStorage.setItem(ACCESS_KEY, link.getAttribute('data-role'));
            } catch (e) { /* sessionStorage unavailable -- portal guard will bounce */ }
        }
    });

    function ready(fn) {
        if (document.readyState !== 'loading') { fn(); }
        else { document.addEventListener('DOMContentLoaded', fn); }
    }

    ready(function () {
        var status = document.getElementById('login-status');
        function showStatus(msg) { if (status) { status.textContent = msg; } }

        // Show / hide password toggle
        var toggle = document.getElementById('showPasswordButton');
        var password = document.getElementById('password');
        if (toggle && password) {
            toggle.addEventListener('click', function () {
                var show = password.type === 'password';
                password.type = show ? 'text' : 'password';
                toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
                toggle.classList.toggle('is-showing', show);
            });
        }

        // Local (backend-less) submit feedback so the form is exercisable
        var form = document.querySelector('.portal-login-form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var role = form.getAttribute('data-role') || 'user';
                var user = document.getElementById('username');
                if (user && !user.value.trim()) {
                    showStatus('Please enter your ' + (user.type === 'email' ? 'email' : 'username') + '.');
                    return;
                }
                showStatus('Login submitted for ' + role + ' portal.');
            });
        }

        // Forgot password / SSO / QR are demo-only; report the intent.
        var forgot = document.getElementById('forgotPasswordButton');
        if (forgot) {
            forgot.addEventListener('click', function () { showStatus('Password reset flow (demo).'); });
        }
        document.querySelectorAll('.sso-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                showStatus('Redirecting to ' + (btn.getAttribute('data-provider') || 'provider') + ' (demo).');
            });
        });
        var qr = document.getElementById('qrLoginButton');
        if (qr) {
            qr.addEventListener('click', function () { showStatus('QR code login (demo).'); });
        }
    });
})();
