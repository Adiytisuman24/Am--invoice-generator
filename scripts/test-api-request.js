const url = process.env.TEST_API_URL || 'http://localhost:3000';

const body = {
  table: 'company_settings',
  action: 'select',
  single: true
};

async function test() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
  }
}

test();
test();
