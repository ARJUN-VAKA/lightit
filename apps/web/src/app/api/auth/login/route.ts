import { NextRequest, NextResponse } from 'next/server';
import { getMockDb, createDemoToken } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const db = getMockDb();
    const user = db.get(email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email.' },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // Role check (optional — if role supplied, verify it matches)
    if (role && user.role !== role && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: `This account is registered as a ${user.role.toLowerCase()}, not a ${role.toLowerCase()}.` },
        { status: 403 }
      );
    }

    const accessToken = createDemoToken(user);

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      data: {
        accessToken,
        refreshToken: accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          company: user.company,
          emailVerified: user.emailVerified,
        },
      },
    });

  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
