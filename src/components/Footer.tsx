import {
  FaXTwitter,
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
} from "react-icons/fa6"
import FooterBackground from "./FooterBackground"

const socialLinks = [
  { label: "X", icon: FaXTwitter },
  { label: "LinkedIn", icon: FaLinkedinIn },
  { label: "GitHub", icon: FaGithub },
  { label: "YouTube", icon: FaYoutube },
]

export default function Footer() {
  return (
    <footer id="contact" className="relative min-h-dvh bg-gray-900 dark:bg-black text-white overflow-hidden snap-start">
      <FooterBackground />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12 lg:px-16 flex flex-col min-h-dvh">
        <div className="flex-1 flex flex-col justify-center lg:flex-row lg:justify-between gap-16 lg:gap-24">
          <div className="max-w-md">
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
              Engineering Africa's technological future. Building the
              products, infrastructure, and intelligence that will make
              the continent a global tech leader.
            </p>
          </div>

          <div className="flex gap-16 sm:gap-24">
            <div>
              <h4 className="text-xs font-semibold text-accent uppercase tracking-widest">
                Pages
              </h4>
              <ul className="mt-6 space-y-4">
                <li>
                  <a
                    href="#vision"
                    className="text-sm sm:text-base text-gray-400 transition-colors hover:text-accent"
                  >
                    Vision
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-accent uppercase tracking-widest">
                Connect
              </h4>
              <ul className="mt-6 space-y-4">
                {socialLinks.map(({ label, icon: Icon }) => (
                  <li key={label}>
                    <span className="inline-flex items-center gap-3 text-base sm:text-lg text-gray-400 transition-colors hover:text-accent cursor-pointer">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-auto pb-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm sm:text-base text-gray-500">
            &copy; {new Date().getFullYear()} WSUITSINDUSTRIES. All rights
            reserved.
          </p>
          <div className="flex gap-8 sm:gap-12">
            <span className="text-sm sm:text-base lg:text-lg text-gray-500 cursor-pointer hover:text-accent transition-colors">
              Privacy Policy
            </span>
            <span className="text-sm sm:text-base lg:text-lg text-gray-500 cursor-pointer hover:text-accent transition-colors">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
