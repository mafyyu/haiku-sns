'use client';

import "./navigation.css";
import Link from 'next/link'
import Image from 'next/image'
import {
  useUser
} from '@clerk/nextjs'

export function Navigation(){
    const { isSignedIn }  = useUser(); 
    return (
        <div className="nav-bar">
        <button type="button" className="nav-bar-button">
          <Link href="/" className='nav-bar-link'>
            <Image
              src="/nav-bar/home.svg"
              alt="Home"
              width={32}
              height={32}
            />
          </Link>
        </button>
        <button type="button" className="nav-bar-button post-icon">
          <Link href={isSignedIn ? "compose/post": "/sign-in" } className='nav-bar-link'>
            <Image
              src="/nav-bar/post.svg"
              alt="Post"
              width={32}
              height={32}
            />
          </Link>
        </button>
        <button type="button" className="nav-bar-button">
          <Link href="/profile" className='nav-bar-link'>
            <Image
              src="/nav-bar/profile.svg"
              alt="Profile"
              width={32}
              height={32}
            />
          </Link>
        </button>
      </div>
    )
}