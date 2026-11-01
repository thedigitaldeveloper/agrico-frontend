'use server';

import { headers } from 'next/headers';

import { clientIp, submitToCms } from '@/lib/cms/submit';
import type { FormState } from '@/lib/form-state';

/**
 * Form submissions run as server actions rather than through a fetch to an API
 * route, so the forms keep working with JavaScript disabled or still loading —
 * which for a lead form is the difference between capturing an enquiry and
 * losing it.
 */


const value = (form: FormData, key: string): string =>
  (form.get(key) as string | null)?.trim() ?? '';

async function forwardedIp(): Promise<string | null> {
  return clientIp(await headers());
}

export async function submitEnquiry(
  _previous: FormState,
  form: FormData
): Promise<FormState> {
  const name = value(form, 'name');
  const email = value(form, 'email');
  const phone = value(form, 'phone');
  const city = value(form, 'city');
  const stateVal = value(form, 'state');
  const program = value(form, 'program') || value(form, 'course');
  const university = value(form, 'university') || value(form, 'targetUniversity');
  const source = value(form, 'source') || 'application-form';
  const rawMessage = value(form, 'message');

  const invalid: string[] = [];
  if (name.length < 2) invalid.push('name');
  const phoneFirstCallback = source === 'homepage-callback';
  if ((!phoneFirstCallback || email) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    invalid.push('email');
  }
  if (!/^[+]?\d[\d\s-]{7,18}$/.test(phone)) invalid.push('phone');
  if (form.get('consent') !== 'on') invalid.push('consent');

  if (invalid.length > 0) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      invalid,
    };
  }

  // Build a structured message string so program and university are never lost
  let formattedMessage = rawMessage;
  const metaTags: string[] = [];
  if (program) metaTags.push(`Interested Program: ${program}`);
  if (university) metaTags.push(`Target University: ${university}`);

  if (metaTags.length > 0) {
    const metaPrefix = `[${metaTags.join(' | ')}]`;
    if (!formattedMessage.includes('Interested Program:') && !formattedMessage.includes('Applied Program:')) {
      formattedMessage = formattedMessage ? `${metaPrefix}\n${formattedMessage}` : metaPrefix;
    }
  }

  const result = await submitToCms(
    '/enquiries',
    {
      name,
      email: email || undefined,
      phone,
      city: city || undefined,
      state: stateVal || undefined,
      message: formattedMessage || undefined,
      source,
      university: university || undefined,
      program: program || undefined,
      consent: true,
    },
    await forwardedIp()
  );

  return result.ok
    ? {
        status: 'success',
        message: 'Thanks — an advisor will be in touch shortly.',
      }
    : { status: 'error', message: result.message };
}

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || `question-${Date.now().toString(36)}`;
}

export async function submitQuestion(
  _previous: FormState,
  form: FormData
): Promise<FormState> {
  const title = value(form, 'title');
  if (title.length < 10) {
    return {
      status: 'error',
      message: 'Please write a question of at least 10 characters.',
      invalid: ['title'],
    };
  }

  const stream = value(form, 'stream');

  const result = await submitToCms(
    '/questions',
    {
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      body: value(form, 'body') || undefined,
      author_name: value(form, 'author_name') || 'Student Member',
      author_email: value(form, 'author_email') || undefined,
      views: 0,
      ...(stream ? { streams: [stream] } : {}),
    },
    await forwardedIp()
  );

  return result.ok
    ? {
        status: 'success',
        message: 'Your question has been received! Our academic advisors will review and publish it with verified guidance shortly.',
      }
    : { status: 'error', message: result.message };
}

export async function submitAnswer(
  _previous: FormState,
  form: FormData
): Promise<FormState> {
  const body = value(form, 'body');
  if (body.length < 20) {
    return {
      status: 'error',
      message: 'Please write an answer of at least 20 characters.',
      invalid: ['body'],
    };
  }

  const result = await submitToCms(
    '/answers',
    {
      body,
      question: value(form, 'question'),
      author_name: value(form, 'author_name') || undefined,
      author_email: value(form, 'author_email') || undefined,
    },
    await forwardedIp()
  );

  return result.ok
    ? {
        status: 'success',
        message: 'Thanks — your answer will appear once it has been reviewed.',
      }
    : { status: 'error', message: result.message };
}
