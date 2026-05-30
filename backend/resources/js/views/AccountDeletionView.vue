<template>
  <div class="deletion-page">
    <LandingHeader />

    <main class="page-body">
      <div class="content-container">
        <h1>Request Account Deletion</h1>
        <p class="intro">
          Use this page to request deletion of your Omni247 account and associated personal data.
          We may retain limited information when required for fraud prevention, security, dispute resolution,
          or legal compliance.
        </p>

        <div v-if="submitted" class="success-banner">
          Your deletion request has been submitted. Our support team will review it and contact you if more verification is needed.
        </div>

        <form class="deletion-form" @submit.prevent="submitRequest">
          <label>
            Full name
            <input v-model.trim="form.name" type="text" maxlength="255" required />
          </label>

          <label>
            Contact email
            <input v-model.trim="form.email" type="email" maxlength="255" required />
          </label>

          <label>
            Account email or username
            <input v-model.trim="form.accountIdentifier" type="text" maxlength="255" placeholder="Email used in the app, if different" />
          </label>

          <label>
            Reason for deletion request
            <textarea
              v-model.trim="form.reason"
              rows="6"
              required
              placeholder="Please confirm that you want your Omni247 account deleted and include any details that help us identify your account."
            />
          </label>

          <div v-if="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <button type="submit" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'Submit deletion request' }}
          </button>
        </form>

        <section class="details">
          <h2>What happens next</h2>
          <ul>
            <li>We review the request and verify the account owner when needed.</li>
            <li>We process deletion of the account and associated personal data that is not required to be retained.</li>
            <li>If we need more information, we contact you using the email address you provide here.</li>
          </ul>
        </section>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import LandingHeader from '@/components/LandingHeader.vue';
import LandingFooter from '@/components/LandingFooter.vue';

const form = reactive({
  name: '',
  email: '',
  accountIdentifier: '',
  reason: '',
});

const submitting = ref(false);
const submitted = ref(false);
const errorMessage = ref('');

const submitRequest = async () => {
  submitting.value = true;
  errorMessage.value = '';

  try {
    const extraDetails = form.accountIdentifier
      ? `\n\nAccount identifier: ${form.accountIdentifier}`
      : '';

    const response = await fetch('/api/support-tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        subject: 'Account deletion request',
        message: `${form.reason}${extraDetails}`,
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      errorMessage.value = payload?.message || 'Unable to submit your deletion request right now.';
      return;
    }

    submitted.value = true;
    form.name = '';
    form.email = '';
    form.accountIdentifier = '';
    form.reason = '';
  } catch (error) {
    errorMessage.value = 'Unable to submit your deletion request right now.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.deletion-page {
  background: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-body {
  flex: 1;
  padding: 40px 16px;
}

.content-container {
  max-width: 760px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 35px rgba(15, 23, 42, 0.08);
  padding: 32px;
}

h1 {
  color: #0f172a;
  font-size: 32px;
  margin-bottom: 12px;
}

.intro {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
}

.deletion-form {
  display: grid;
  gap: 16px;
}

label {
  display: grid;
  gap: 8px;
  color: #0f172a;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  color: #0f172a;
  background: #fff;
}

textarea {
  resize: vertical;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 14px 20px;
  font: inherit;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: default;
}

.success-banner,
.error-banner {
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
}

.success-banner {
  background: #ecfdf5;
  color: #166534;
}

.error-banner {
  background: #fef2f2;
  color: #991b1b;
}

.details {
  margin-top: 28px;
}

.details h2 {
  font-size: 22px;
  color: #0f172a;
  margin-bottom: 12px;
}

.details ul {
  margin: 0;
  padding-left: 20px;
  color: #475569;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .content-container {
    padding: 24px;
    border-radius: 0;
  }
}
</style>
