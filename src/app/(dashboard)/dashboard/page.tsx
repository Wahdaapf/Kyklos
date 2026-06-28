"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Users,
  Calendar,
  MessageCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bell,
  LogOut,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  CreditCard,
  QrCode,
  Flame,
  Award,
  Menu,
  Trophy,
  RefreshCw,
  MessageSquare,
  User,
  Building,
  Upload,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

// --- Types ---
interface Community {
  id: string;
  name: string;
  type: string;
  role: "Admin" | "Member";
  logoColor: string; // fallback class
  primaryColor: string; // Hex color code
  description: string;
  logoName?: string;
  inviteCode?: string;
  arisan_nominal?: number | null;
  arisan_period?: string | null;
}

interface ArisanRound {
  id: string;
  community_id: string;
  round_number: number;
  winner_profile_id: string | null;
  total_prize: number;
  drawn_at: string;
  status: string;
  winner_profile?: {
    id: string;
    full_name: string;
  } | null;
}


interface Pocket {
  id: string;
  name: string;
  balance: number;
  tone: "primary" | "accent" | "warning";
}

interface Transaction {
  id: string;
  name: string;      // maps to description
  pocket: string;    // maps to pocket name
  amount: number;
  type: "in" | "out"; // 'income' -> 'in', 'expense' -> 'out'
  date: string;
  author: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  when: string;
  event_date?: string; // ISO string from DB
  price?: number;
  pocket_id?: string | null;
  status: "upcoming" | "done";
  userRSVP: "none" | "yes" | "no" | "maybe";
  rsvpYesCount: number;
  rsvpNoCount: number;
  rsvpMaybeCount: number;
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  comments: { author: string; content: string; date: string }[];
  hot: boolean;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  role: "Admin" | "Member";
  iuranStatus: "Lunas" | "Menunggak";
}

// --- Default Data ---
const DEFAULT_COMMUNITIES: Community[] = [
  {
    id: "rt-01-makmur",
    name: "RT 01 Makmur",
    type: "Neighborhood (RT/RW)",
    role: "Admin",
    logoColor: "bg-emerald-600",
    primaryColor: "#059669", // emerald-600
    description: "Komunitas kerukunan tetangga RT 01 Kelurahan Makmur Sejahtera.",
    inviteCode: "RT-01-CODE",
  },
  {
    id: "arisan-melati",
    name: "Arisan Melati",
    type: "Family Arisan",
    role: "Member",
    logoColor: "bg-violet-600",
    primaryColor: "#7c3aed", // violet-600
    description: "Arisan rutin keluarga besar Melati putaran tahun 2026.",
    inviteCode: "MELATI-6",
  },
  {
    id: "alumni-sma1",
    name: "Alumni SMA 1",
    type: "Alumni",
    role: "Member",
    logoColor: "bg-blue-600",
    primaryColor: "#2563eb", // blue-600
    description: "Ikatan Alumni SMA Negeri 1 Angkatan Reuni Akbar.",
    inviteCode: "ALUMNI-1",
  },
];

const DEFAULT_POCKETS: Record<string, Pocket[]> = {
  "rt-01-makmur": [
    { id: "p1", name: "Treasury (Dana Kas)", balance: 6200000, tone: "primary" },
    { id: "p2", name: "Sosial & Kematian", balance: 4800000, tone: "accent" },
    { id: "p3", name: "Pembangunan Gapura", balance: 1450000, tone: "warning" },
  ],
  "arisan-melati": [
    { id: "p4", name: "Arisan (Dana Putaran)", balance: 8000000, tone: "primary" },
    { id: "p5", name: "Uang Kas Arisan", balance: 2450000, tone: "accent" },
  ],
  "alumni-sma1": [
    { id: "p6", name: "Treasury (Kas Utama)", balance: 15450000, tone: "primary" },
    { id: "p7", name: "Dana Bantuan Sosial", balance: 3500000, tone: "warning" },
  ],
};

const DEFAULT_TRANSACTIONS: Record<string, Transaction[]> = {
  "rt-01-makmur": [
    { id: "t1", name: "Iuran Juni — Budi", pocket: "Treasury (Dana Kas)", amount: 150000, type: "in", date: "Hari ini", author: "Budi" },
    { id: "t2", name: "Konsumsi rapat pengurus", pocket: "Treasury (Dana Kas)", amount: 320000, type: "out", date: "Kemarin", author: "Admin (Saya)" },
    { id: "t3", name: "Sumbangan duka cita", pocket: "Sosial & Kematian", amount: 500000, type: "out", date: "25 Jun", author: "Admin (Saya)" },
  ],
  "arisan-melati": [
    { id: "t4", name: "Setoran arisan — Sari", pocket: "Arisan (Dana Putaran)", amount: 500000, type: "in", date: "Hari ini", author: "Sari" },
    { id: "t5", name: "Beli Snack Rapat Kocokan", pocket: "Uang Kas Arisan", amount: 120000, type: "out", date: "24 Jun", author: "Admin Melati" },
  ],
  "alumni-sma1": [
    { id: "t6", name: "Donasi Reuni Akbar — Adi", pocket: "Treasury (Kas Utama)", amount: 2000000, type: "in", date: "25 Jun", author: "Adi" },
    { id: "t7", name: "Sewa aula pertemuan", pocket: "Treasury (Kas Utama)", amount: 1500000, type: "out", date: "23 Jun", author: "Admin Alumni" },
  ],
};

const DEFAULT_EVENTS: Record<string, Event[]> = {
  "rt-01-makmur": [
    {
      id: "e1",
      title: "Rapat Bulanan Warga",
      description: "Pembahasan evaluasi iuran bulanan dan program kerja.",
      location: "Balai RW 05",
      when: "Sabtu, 28 Jun · 19.30",
      status: "upcoming",
      userRSVP: "none",
      rsvpYesCount: 20,
      rsvpNoCount: 2,
      rsvpMaybeCount: 4,
    },
    {
      id: "e2",
      title: "Kerja Bakti Kebersihan",
      description: "Kegiatan bersih-bersih lingkungan menyambut musim hujan.",
      location: "Fasum Lapangan Utama",
      when: "Minggu, 6 Jul · 07.30",
      status: "upcoming",
      userRSVP: "none",
      rsvpYesCount: 30,
      rsvpNoCount: 0,
      rsvpMaybeCount: 2,
    },
    {
      id: "e3",
      title: "Tutup Buku Laporan Mei",
      description: "Audit akhir laporan kas bulanan.",
      location: "Online",
      when: "Selesai 31 Mei",
      status: "done",
      userRSVP: "yes",
      rsvpYesCount: 42,
      rsvpNoCount: 0,
      rsvpMaybeCount: 0,
    },
  ],
  "arisan-melati": [
    {
      id: "e4",
      title: "Arisan & Kocokan Putaran 6",
      description: "Rapat bulanan arisan rutin keluarga Melati.",
      location: "Kediaman Ibu Tina",
      when: "Minggu, 5 Jul · 10.00",
      status: "upcoming",
      userRSVP: "none",
      rsvpYesCount: 12,
      rsvpNoCount: 1,
      rsvpMaybeCount: 1,
    },
  ],
  "alumni-sma1": [
    {
      id: "e5",
      title: "Rapat Panitia Reuni",
      description: "Pemantapan rundown dan anggaran konsumsi reuni.",
      location: "Cafe Kopi Kenangan",
      when: "Kamis, 2 Jul · 19.00",
      status: "upcoming",
      userRSVP: "none",
      rsvpYesCount: 15,
      rsvpNoCount: 2,
      rsvpMaybeCount: 3,
    },
  ],
};

const DEFAULT_DISCUSSIONS: Record<string, Discussion[]> = {
  "rt-01-makmur": [
    {
      id: "d1",
      title: "Rencana perbaikan pos ronda depan",
      author: "Pak Budi",
      hot: true,
      comments: [
        { author: "Sari", content: "Setuju sekali, lampunya sering mati kalau malam.", date: "2 jam lalu" },
        { author: "Adit", content: "Perlu sumbangan semen atau langsung beli pos jadi saja?", date: "1 jam lalu" },
      ],
    },
    {
      id: "d2",
      title: "Pengadaan tong sampah organik/non-organik",
      author: "Bu Desi",
      hot: false,
      comments: [],
    },
  ],
  "arisan-melati": [
    {
      id: "d3",
      title: "Rekomendasi tempat liburan akhir tahun arisan",
      author: "Bu Tina",
      hot: true,
      comments: [
        { author: "Sari", content: "Bagaimana kalau kita ke Puncak saja yang dekat?", date: "1 hari lalu" },
      ],
    },
  ],
  "alumni-sma1": [
    {
      id: "d4",
      title: "Pemilihan ketua panitia reuni akbar 2026",
      author: "Andi",
      hot: true,
      comments: [],
    },
  ],
};

const DEFAULT_MEMBERS: Record<string, Member[]> = {
  "rt-01-makmur": [
    { id: "m1", name: "Wahda Adella", phone: "08123456789", role: "Admin", iuranStatus: "Menunggak" },
    { id: "m2", name: "Budi", phone: "08198765432", role: "Member", iuranStatus: "Lunas" },
    { id: "m3", name: "Sari", phone: "08523456789", role: "Member", iuranStatus: "Lunas" },
    { id: "m4", name: "Adit", phone: "08987654321", role: "Member", iuranStatus: "Menunggak" },
    { id: "m5", name: "Desi", phone: "08111222333", role: "Member", iuranStatus: "Lunas" },
  ],
  "arisan-melati": [
    { id: "m6", name: "Wahda Adella", phone: "08123456789", role: "Member", iuranStatus: "Menunggak" },
    { id: "m7", name: "Sari", phone: "08523456789", role: "Member", iuranStatus: "Lunas" },
    { id: "m8", name: "Bu Tina (Ketua)", phone: "08111222333", role: "Admin", iuranStatus: "Lunas" },
  ],
  "alumni-sma1": [
    { id: "m9", name: "Wahda Adella", phone: "08123456789", role: "Member", iuranStatus: "Lunas" },
    { id: "m10", name: "Andi", phone: "0811223344", role: "Admin", iuranStatus: "Lunas" },
  ],
};

export default function DashboardPage() {
  const router = useRouter();

  // --- Supabase Authentication & Loading ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- States ---
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "wallet" | "arisan" | "discussion" | "events" | "members">("dashboard");
  const [landingTab, setLandingTab] = useState<"communities" | "profile">("communities");

  // Mock Database & Live Sync
  const [pockets, setPockets] = useState<Record<string, Pocket[]>>(DEFAULT_POCKETS);
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>(DEFAULT_TRANSACTIONS);
  const [events, setEvents] = useState<Record<string, Event[]>>(DEFAULT_EVENTS);
  const [discussions, setDiscussions] = useState<Record<string, Discussion[]>>(DEFAULT_DISCUSSIONS);
  const [members, setMembers] = useState<Record<string, Member[]>>(DEFAULT_MEMBERS);

  // User details state (for general profile edit)
  const [profileName, setProfileName] = useState("Wahda Adella");
  const [profilePhone, setProfilePhone] = useState("08123456789");
  const [profileEmail, setProfileEmail] = useState("wahdaadella.ba@gmail.com");

  // Track active draw details
  const [arisanWinner, setArisanWinner] = useState<string | null>(null);
  const [isDrawingArisan, setIsDrawingArisan] = useState(false);
  const [arisanHistory, setArisanHistory] = useState<Record<string, string[]>>({
    "rt-01-makmur": ["Pak Budi (Putaran 5)", "Bu Sari (Putaran 4)"],
    "arisan-melati": ["Bu Sari (Putaran 5)", "Adit (Putaran 4)"],
    "alumni-sma1": ["Tina (Putaran 1)"],
  });
  const [arisanRounds, setArisanRounds] = useState<ArisanRound[]>([]);
  const [arisanBills, setArisanBills] = useState<Record<string, any[]>>({});
  const [isMulaiArisanOpen, setIsMulaiArisanOpen] = useState(false);
  const [arisanInputAmount, setArisanInputAmount] = useState("50000");
  const [isLoadingArisan, setIsLoadingArisan] = useState(false);


  // Mobile sidebar visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);
  const [isJoinCommOpen, setIsJoinCommOpen] = useState(false);
  const [isAddPocketOpen, setIsAddPocketOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  // 1. Identitas Dasar Komunitas
  const [newCommName, setNewCommName] = useState("");
  const [newCommType, setNewCommType] = useState<string>("Neighborhood (RT/RW)");
  const [newCommDesc, setNewCommDesc] = useState("");

  // 2. Konfigurasi Whitelabel
  const [newCommLogoName, setNewCommLogoName] = useState("");
  const [newCommColor, setNewCommColor] = useState("#6366f1");

  // 3. Inisialisasi Kantong Dana Keuangan
  const [initTreasury, setInitTreasury] = useState(true);
  const [initArisan, setInitArisan] = useState(false);
  const [initDues, setInitDues] = useState(true);
  const [initEvent, setInitEvent] = useState(false);
  const [newCommDuesAmount, setNewCommDuesAmount] = useState("50000");

  // Other form states
  const [joinCode, setJoinCode] = useState("");
  const [newPocketName, setNewPocketName] = useState("");
  const [newPocketBalance, setNewPocketBalance] = useState("");
  const [newPocketTone, setNewPocketTone] = useState<"primary" | "accent" | "warning">("primary");

  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState<"in" | "out">("in");
  const [txPocketId, setTxPocketId] = useState("");

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventWhen, setNewEventWhen] = useState("");
  const [newEventDate, setNewEventDate] = useState(""); // datetime-local
  const [newEventPrice, setNewEventPrice] = useState("0");
  const [newEventPocketId, setNewEventPocketId] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");

  // Wallet Sub-menus
  const [walletTab, setWalletTab] = useState<"pockets" | "iuran" | "my_iuran">("pockets");
  const [myUnpaidDues, setMyUnpaidDues] = useState<any[]>([]);
  const [communityDuesBills, setCommunityDuesBills] = useState<any[]>([]);
  const [lastDuesBillDate, setLastDuesBillDate] = useState<string | null>(null);
  const [isCheckingDuesStatus, setIsCheckingDuesStatus] = useState(true);
  const [selectedBillToPay, setSelectedBillToPay] = useState<any | null>(null);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<string | null>(null);

  const activeCommunity = communities.find((c) => c.id === selectedCommunityId);

  // Load initial data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // 1. Get current logged in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setCurrentUser(user);
        setProfileEmail(user.email || "");

        // 2. Get profile details
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setProfileName(profile.full_name || "Wahda Adella");
          setProfilePhone(profile.phone || "");
        }

        // 3. Get user's communities
        const { data: memberRecords, error: memberError } = await supabase
          .from("community_members")
          .select(`
            role,
            communities (
              id,
              name,
              type,
              description,
              logo_url,
              primary_color,
              invite_code
            )
          `)
          .eq("profile_id", user.id);

        if (memberRecords) {
          const loadedComms: Community[] = memberRecords
            .filter((r: any) => r.communities !== null)
            .map((r: any) => {
              const c = r.communities;
              return {
                id: c.id,
                name: c.name,
                type: c.type,
                role: r.role === "admin" ? "Admin" : "Member",
                logoColor: "bg-indigo-600",
                primaryColor: c.primary_color || "#6366f1",
                description: c.description || "",
                logoName: c.logo_url || undefined,
                inviteCode: c.invite_code || undefined,
              };
            });

          // Set to the real communities list from Supabase. If empty, the user has no communities.
          setCommunities(loadedComms);

          // 4. Fetch all pockets
          const { data: allPockets } = await supabase
            .from("fund_pockets")
            .select("*");

          const pocketMap: Record<string, Pocket[]> = { ...DEFAULT_POCKETS };
          if (allPockets && allPockets.length > 0) {
            allPockets.forEach((p: any) => {
              if (!pocketMap[p.community_id]) pocketMap[p.community_id] = [];

              // Only push if not already loaded from defaults
              const exists = pocketMap[p.community_id].some(ex => ex.id === p.id);
              if (!exists) {
                pocketMap[p.community_id].push({
                  id: p.id,
                  name: p.name,
                  balance: Number(p.balance),
                  tone: "primary",
                });
              }
            });
          }

          // Make sure fallbacks are there
          const commsList = loadedComms;
          commsList.forEach((comm) => {
            if (!pocketMap[comm.id]) {
              pocketMap[comm.id] = [
                { id: `p-init-${comm.id}`, name: "Treasury (Kas Utama)", balance: 0, tone: "primary" }
              ];
            }
          });
          setPockets(pocketMap);

          // 5. Fetch community members list
          const { data: allMembers } = await supabase
            .from("community_members")
            .select(`
              community_id,
              role,
              profile:profiles (
                id,
                full_name,
                phone
              )
            `);

          const memberMap: Record<string, Member[]> = { ...DEFAULT_MEMBERS };
          if (allMembers && allMembers.length > 0) {
            allMembers.forEach((m: any) => {
              if (!m.profile) return;
              if (!memberMap[m.community_id]) memberMap[m.community_id] = [];

              const exists = memberMap[m.community_id].some((ex: any) => ex.id === m.profile.id);
              if (!exists) {
                memberMap[m.community_id].push({
                  id: m.profile.id,
                  name: m.profile.full_name || "Anonymous Warga",
                  phone: m.profile.phone || "-",
                  role: m.role === "admin" ? "Admin" : "Member",
                  iuranStatus: m.profile.id === user.id ? "Menunggak" : "Lunas",
                });
              }
            });
          }

          commsList.forEach((comm) => {
            if (!memberMap[comm.id]) {
              memberMap[comm.id] = [
                { id: user.id, name: profile?.full_name || "Wahda Adella", phone: profile?.phone || "-", role: comm.role, iuranStatus: "Menunggak" }
              ];
            }
          });
          setMembers(memberMap);

          // 6. Fetch all transactions (Buku Kas Terbuka)
          const { data: allTxs } = await supabase
            .from("transactions")
            .select(`
              *,
              fund_pockets (name),
              profiles (full_name)
            `)
            .order("created_at", { ascending: false });

          const txMap: Record<string, Transaction[]> = { ...DEFAULT_TRANSACTIONS };
          if (allTxs && allTxs.length > 0) {
            allTxs.forEach((t: any) => {
              if (!txMap[t.community_id]) txMap[t.community_id] = [];

              // Prevent duplicates with default data
              const exists = txMap[t.community_id].some((ex) => ex.id === t.id);
              if (!exists) {
                txMap[t.community_id].push({
                  id: t.id,
                  name: t.description,
                  pocket: t.fund_pockets?.name || "Treasury",
                  amount: Number(t.amount),
                  type: t.type === "income" ? "in" : "out",
                  date: new Date(t.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }),
                  author: t.profiles?.full_name || "System",
                });
              }
            });
          }
          setTransactions(txMap);
        }
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const fetchArisanRounds = async (communityId: string) => {
    if (!communityId) return;
    setIsLoadingArisan(true);
    try {
      const { data, error } = await supabase
        .from("arisan_rounds")
        .select(`
          *,
          winner_profile:profiles(id, full_name)
        `)
        .eq("community_id", communityId)
        .order("round_number", { ascending: true });

      if (error) {
        console.error("Error fetching arisan rounds:", error);
      } else {
        setArisanRounds(data || []);

        const activeRound = data?.find((r: any) => r.status === 'pending');
        if (activeRound) {
          const { data: bills, error: billsErr } = await supabase
            .from("dues_bills")
            .select(`
              id,
              title,
              amount,
              status,
              due_date,
              pocket_id,
              profile:profiles (
                id,
                full_name,
                phone
              )
            `)
            .eq("community_id", communityId)
            .eq("title", `Arisan Putaran ${activeRound.round_number}`);

          if (billsErr) {
            console.error("Error fetching arisan bills:", billsErr);
          } else {
            setArisanBills(prev => ({ ...prev, [communityId]: bills || [] }));
          }
        } else {
          setArisanBills(prev => ({ ...prev, [communityId]: [] }));
        }
      }
    } catch (err) {
      console.error("Error in fetchArisanRounds:", err);
    } finally {
      setIsLoadingArisan(false);
    }
  };

  const handleToggleArisanBillStatus = async (billId: string, currentStatus: string) => {
    if (!selectedCommunityId) return;
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";

    try {
      const { error } = await supabase
        .from("dues_bills")
        .update({ status: newStatus })
        .eq("id", billId);

      if (error) {
        console.error("Gagal mengubah status tagihan:", error);
        Swal.fire({
          title: "Gagal",
          text: `Gagal memperbarui status pembayaran: ${error.message}`,
          icon: "error",
          confirmButtonColor: activeCommunity?.primaryColor || "#6366f1"
        });
      } else {
        // Update local state
        const updated = (arisanBills[selectedCommunityId] || []).map((b: any) => {
          if (b.id === billId) {
            return { ...b, status: newStatus };
          }
          return b;
        });
        setArisanBills({
          ...arisanBills,
          [selectedCommunityId]: updated
        });

        Swal.fire({
          title: "Sukses",
          text: `Status tagihan berhasil diubah menjadi ${newStatus === "paid" ? "Lunas" : "Belum Bayar"}.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchEvents = async (communityId: string, userId?: string) => {
    if (!communityId) return;
    try {
      // Fetch events with RSVP counts
      const { data: eventsData, error: eventsErr } = await supabase
        .from("events")
        .select(`
          id, title, description, location, event_date, price, pocket_id, created_by,
          event_rsvps (id, profile_id, status)
        `)
        .eq("community_id", communityId)
        .order("event_date", { ascending: true });

      if (eventsErr) {
        console.error("Error fetching events:", eventsErr);
        return;
      }

      const mapped: Event[] = (eventsData || []).map((e: any) => {
        const rsvps: any[] = e.event_rsvps || [];
        const myRsvp = rsvps.find((r: any) => r.profile_id === userId);
        const now = new Date();
        const eventDate = e.event_date ? new Date(e.event_date) : null;

        // Format date for display
        const whenStr = eventDate
          ? eventDate.toLocaleString("id-ID", {
            weekday: "short", day: "numeric", month: "short",
            hour: "2-digit", minute: "2-digit"
          }) + " WIB"
          : "-";

        return {
          id: e.id,
          title: e.title,
          description: e.description || "",
          location: e.location || "",
          when: whenStr,
          event_date: e.event_date,
          price: Number(e.price) || 0,
          pocket_id: e.pocket_id,
          status: (eventDate && eventDate < now) ? "done" : "upcoming",
          userRSVP: myRsvp ? (myRsvp.status === "attending" ? "yes" : myRsvp.status === "absent" ? "no" : "maybe") : "none",
          rsvpYesCount: rsvps.filter((r: any) => r.status === "attending").length,
          rsvpNoCount: rsvps.filter((r: any) => r.status === "absent").length,
          rsvpMaybeCount: rsvps.filter((r: any) => r.status === "maybe").length,
        };
      });

      setEvents(prev => ({ ...prev, [communityId]: mapped }));
    } catch (err) {
      console.error("Error in fetchEvents:", err);
    }
  };

  const fetchMyUnpaidDues = async (communityId: string, userId: string) => {
    if (!communityId || !userId) return;
    try {
      const { data, error } = await supabase
        .from("dues_bills")
        .select(`
          id,
          title,
          amount,
          status,
          due_date,
          pocket_id
        `)
        .eq("community_id", communityId)
        .eq("profile_id", userId)
        .eq("status", "unpaid")
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching unpaid dues bills:", error);
      } else {
        setMyUnpaidDues(data || []);
      }
    } catch (err) {
      console.error("Error in fetchMyUnpaidDues:", err);
    }
  };

  const fetchCommunityDuesBills = async (communityId: string) => {
    if (!communityId) return;
    try {
      const { data, error } = await supabase
        .from("dues_bills")
        .select(`
          id,
          title,
          amount,
          due_date,
          status,
          community_id,
          profile_id,
          profiles:profiles (
            id,
            full_name,
            phone
          )
        `)
        .eq("community_id", communityId)
        .eq("status", "unpaid")
        .order("due_date", { ascending: true });

      if (error) {
        console.error("Error fetching community dues bills:", error);
      } else {
        setCommunityDuesBills(data || []);
      }
    } catch (err) {
      console.error("Error in fetchCommunityDuesBills:", err);
    }
  };

  const INDO_MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const fetchLastDuesBill = async (communityId: string, userId: string) => {
    if (!communityId || !userId) return;
    try {
      setIsCheckingDuesStatus(true);
      const { data, error } = await supabase
        .from("dues_bills")
        .select("due_date")
        .eq("community_id", communityId)
        .eq("profile_id", userId)
        .order("due_date", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching last dues bill:", error);
      } else if (data && data.length > 0) {
        setLastDuesBillDate(data[0].due_date);
      } else {
        setLastDuesBillDate(null);
      }
    } catch (err) {
      console.error("Error in fetchLastDuesBill:", err);
    } finally {
      setIsCheckingDuesStatus(false);
    }
  };

  const shouldShowCreateDuesButton = () => {
    if (isCheckingDuesStatus) return false;
    if (!lastDuesBillDate) return true; // Show to create the first monthly dues!

    const parts = lastDuesBillDate.split("-");
    const lastYear = parseInt(parts[0], 10);
    const lastMonth = parseInt(parts[1], 10);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const lastMonthIndex = lastYear * 12 + lastMonth;
    const currentMonthIndex = currentYear * 12 + currentMonth;

    return currentMonthIndex > lastMonthIndex;
  };

  const getNextDuesMonthDetails = () => {
    if (!lastDuesBillDate) {
      const now = new Date();
      return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      };
    }
    const parts = lastDuesBillDate.split("-");
    const lastYear = parseInt(parts[0], 10);
    const lastMonth = parseInt(parts[1], 10);

    let nextMonth = lastMonth + 1;
    let nextYear = lastYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    return { month: nextMonth, year: nextYear };
  };

  const getLastDayOfMonth = (year: number, month: number) => {
    const date = new Date(year, month, 0);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };


  const handleRedirectToInvoice = async () => {
    if (!selectedCommunityId || !currentUser) return;

    try {
      const billId = selectedBillToPay?.id || null;
      const amount = selectedBillToPay ? Number(selectedBillToPay.amount) : 50000;
      const description = selectedBillToPay
        ? `${selectedBillToPay.title} oleh ${profileName}`
        : `Iuran bulanan kas ${activeCommunity?.name} oleh ${profileName}`;

      const res = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          bill_id: billId,
          community_id: selectedCommunityId,
          profile_id: currentUser.id,
          email: profileEmail || undefined,
          name: profileName,
          phone: profilePhone || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal membuat link pembayaran Xendit.");
      }

      const data = await res.json();
      if (data.invoice_url) {
        setIsPaymentOpen(false);
        window.open(data.invoice_url, "_blank");

        Swal.fire({
          title: "Pembayaran Dibuka",
          text: "Halaman pembayaran Xendit telah dibuka di tab baru. Silakan selesaikan pembayaran Anda di sana.",
          icon: "info",
          confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
        });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal membuat tagihan iuran.",
        icon: "error",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
    }
  };


  // Update active community details when user switches
  useEffect(() => {
    if (selectedCommunityId) {
      setActiveTab("dashboard");
      setWalletTab("pockets");
      setActiveDiscussionId(null);
      fetchArisanRounds(selectedCommunityId);
      fetchEvents(selectedCommunityId, currentUser?.id);
      if (currentUser?.id) {
        fetchMyUnpaidDues(selectedCommunityId, currentUser.id);
        fetchLastDuesBill(selectedCommunityId, currentUser.id);
      }
      fetchCommunityDuesBills(selectedCommunityId);
    }
  }, [selectedCommunityId, currentUser]);

  const handleConfirmMulaiArisan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunityId || !currentUser) return;

    try {
      setIsLoadingArisan(true);
      const amount = parseFloat(arisanInputAmount) || 0;
      if (amount <= 0) {
        Swal.fire({
          title: "Peringatan",
          text: "Nominal arisan harus lebih besar dari 0!",
          icon: "warning",
          confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
        });
        setIsLoadingArisan(false);
        return;
      }

      // 1. Calculate next round number
      const nextRoundNumber = arisanRounds.length > 0
        ? Math.max(...arisanRounds.map(r => r.round_number)) + 1
        : 1;

      // 2. Fetch active community members
      const activeMembers = members[selectedCommunityId] || [];
      if (activeMembers.length === 0) {
        Swal.fire({
          title: "Peringatan",
          text: "Komunitas ini belum memiliki anggota!",
          icon: "warning",
          confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
        });
        setIsLoadingArisan(false);
        return;
      }

      // Calculate total prize
      const totalPrize = amount * activeMembers.length;

      // 3. Create new record in arisan_rounds
      const { data: newRound, error: roundErr } = await supabase
        .from("arisan_rounds")
        .insert({
          community_id: selectedCommunityId,
          round_number: nextRoundNumber,
          total_prize: totalPrize,
          status: "pending"
        })
        .select()
        .single();

      if (roundErr) {
        console.error("Error creating arisan round:", roundErr);
        Swal.fire({
          title: "Gagal",
          text: `Gagal memulai putaran arisan: ${roundErr.message}`,
          icon: "error",
          confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
        });
        setIsLoadingArisan(false);
        return;
      }

      // 4. Create dues bills for all members
      // Find the pocket ID for Arisan (Dana Putaran)
      const communityPockets = pockets[selectedCommunityId] || [];
      const arisanPocket = communityPockets.find(p => p.name.toLowerCase().includes("arisan")) || communityPockets[0];
      const pocketId = arisanPocket?.id || null;

      // Format today's date YYYY-MM-DD
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const dueDateString = `${year}-${month}-${date}`;

      const billsToInsert = activeMembers.map((member) => ({
        community_id: selectedCommunityId,
        profile_id: member.id, // profile id of member
        title: `Arisan Putaran ${nextRoundNumber}`,
        amount: amount,
        due_date: dueDateString,
        status: "unpaid",
        pocket_id: pocketId,
      }));

      const { error: insertErr } = await supabase
        .from("dues_bills")
        .insert(billsToInsert);

      if (insertErr) {
        console.error("Error creating dues bills:", insertErr);
        Swal.fire({
          title: "Gagal",
          text: `Gagal membuat tagihan iuran arisan: ${insertErr.message}`,
          icon: "error",
          confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
        });
      } else {
        Swal.fire({
          title: "Arisan Dimulai!",
          text: `Arisan Putaran ${nextRoundNumber} berhasil dimulai dengan iuran sebesar Rp ${amount.toLocaleString("id-ID")} per anggota!`,
          icon: "success",
          confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
        });
      }

      // 5. Reload rounds and close modal
      await fetchArisanRounds(selectedCommunityId);
      setIsMulaiArisanOpen(false);

    } catch (err: any) {
      console.error("Error in handleConfirmMulaiArisan:", err);
      Swal.fire({
        title: "Terjadi Kesalahan",
        text: err.message || String(err),
        icon: "error",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
    } finally {
      setIsLoadingArisan(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // --- Handlers ---
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim() || !currentUser) return;

    try {
      // 1. Generate unique 10-char invite code
      const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const inviteCode = `${newCommName.substring(0, 4).toUpperCase().replace(/\s+/g, "")}-${randStr}`.substring(0, 10);

      // 2. Insert community
      const { data: newCommData, error: commError } = await supabase
        .from("communities")
        .insert({
          name: newCommName,
          type: newCommType,
          description: newCommDesc,
          logo_url: newCommLogoName || null,
          primary_color: newCommColor,
          invite_code: inviteCode,
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (commError || !newCommData) {
        alert(`Gagal membuat komunitas: ${commError?.message}`);
        return;
      }

      // 3. Insert community member (creator is Admin/admin)
      const { error: memberError } = await supabase
        .from("community_members")
        .insert({
          community_id: newCommData.id,
          profile_id: currentUser.id,
          role: "admin",
        });

      if (memberError) {
        alert(`Gagal mendaftarkan anggota: ${memberError.message}`);
        return;
      }

      // 4. Insert fund pockets
      const pocketsToInsert = [];
      if (initTreasury) pocketsToInsert.push({ community_id: newCommData.id, name: "Treasury (Kas Utama)", balance: 0 });
      if (initArisan) pocketsToInsert.push({ community_id: newCommData.id, name: "Arisan (Dana Putaran)", balance: 0 });
      if (initDues) {
        const amountLabel = newCommDuesAmount ? ` - Rp ${parseInt(newCommDuesAmount).toLocaleString("id-ID")}/Bulan` : "";
        pocketsToInsert.push({ community_id: newCommData.id, name: `Recurring Dues (Iuran Wajib${amountLabel})`, balance: 0 });
      }
      if (initEvent) pocketsToInsert.push({ community_id: newCommData.id, name: "Event Fund (Dana Khusus Acara)", balance: 0 });

      if (pocketsToInsert.length === 0) {
        pocketsToInsert.push({ community_id: newCommData.id, name: "Treasury (Kas Utama)", balance: 0 });
      }

      const { data: insertedPockets, error: pocketError } = await supabase
        .from("fund_pockets")
        .insert(pocketsToInsert)
        .select();

      if (pocketError) {
        console.error("Gagal inisialisasi kantong dana:", pocketError);
      }

      // Insert dues bill for the creator if recurring dues is enabled
      if (initDues) {
        let recurringDuesPocketId = null;

        // Try to find it in the recently inserted pockets
        if (insertedPockets) {
          const found = insertedPockets.find((p: any) =>
            p.name.toLowerCase().includes("recurring dues")
          );
          if (found) {
            recurringDuesPocketId = found.id;
          }
        }

        // If not found in memory, query from the database as a fallback
        if (!recurringDuesPocketId) {
          const { data: dbPockets } = await supabase
            .from("fund_pockets")
            .select("id, name")
            .eq("community_id", newCommData.id);

          if (dbPockets) {
            const found = dbPockets.find((p: any) =>
              p.name.toLowerCase().includes("recurring dues")
            );
            if (found) {
              recurringDuesPocketId = found.id;
            }
          }
        }

        if (recurringDuesPocketId) {
          const now = new Date();
          const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          const year = lastDay.getFullYear();
          const month = String(lastDay.getMonth() + 1).padStart(2, "0");
          const date = String(lastDay.getDate()).padStart(2, "0");
          const dueDateString = `${year}-${month}-${date}`;

          const { error: duesBillError } = await supabase
            .from("dues_bills")
            .insert({
              community_id: newCommData.id,
              profile_id: currentUser.id,
              title: "Iuran Wajib",
              amount: parseFloat(newCommDuesAmount) || 0,
              due_date: dueDateString,
              status: "unpaid",
              pocket_id: recurringDuesPocketId,
            });

          if (duesBillError) {
            console.error("Gagal mencatat tagihan iuran awal:", duesBillError);
          }
        }
      }

      // 5. Update local states
      const newComm: Community = {
        id: newCommData.id,
        name: newCommData.name,
        type: newCommData.type,
        role: "Admin",
        logoColor: "bg-indigo-600",
        primaryColor: newCommData.primary_color || "#6366f1",
        description: newCommData.description || "",
        logoName: newCommData.logo_url || undefined,
        inviteCode: newCommData.invite_code || undefined,
      };

      const mappedPockets: Pocket[] = (insertedPockets || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        balance: Number(p.balance),
        tone: "primary",
      }));

      setCommunities([...communities, newComm]);
      setPockets({
        ...pockets,
        [newCommData.id]: mappedPockets,
      });
      setTransactions({ ...transactions, [newCommData.id]: [] });
      setEvents({ ...events, [newCommData.id]: [] });
      setDiscussions({ ...discussions, [newCommData.id]: [] });
      setMembers({
        ...members,
        [newCommData.id]: [{ id: currentUser.id, name: profileName, phone: profilePhone, role: "Admin", iuranStatus: "Menunggak" }],
      });

      // Reset fields
      setNewCommName("");
      setNewCommDesc("");
      setNewCommLogoName("");
      setNewCommColor("#6366f1");
      setInitTreasury(true);
      setInitArisan(false);
      setInitDues(true);
      setInitEvent(false);
      setNewCommDuesAmount("50000");

      setIsCreateCommOpen(false);
      setSelectedCommunityId(newCommData.id); // Switch to active dashboard
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  const handleJoinCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !currentUser) return;

    try {
      // 1. Get community by invite code
      const { data: targetComm, error: fetchError } = await supabase
        .from("communities")
        .select("*")
        .eq("invite_code", joinCode.trim())
        .single();

      if (fetchError || !targetComm) {
        alert("Kode undangan salah atau komunitas tidak ditemukan!");
        return;
      }

      // 2. Join as member
      const { error: joinError } = await supabase
        .from("community_members")
        .insert({
          community_id: targetComm.id,
          profile_id: currentUser.id,
          role: "member",
        });

      if (joinError) {
        // If already member, just switch to it
        if (joinError.code === "23505") { // unique constraint violation
          setSelectedCommunityId(targetComm.id);
          setIsJoinCommOpen(false);
          setJoinCode("");
          return;
        }
        alert(`Gagal bergabung: ${joinError.message}`);
        return;
      }

      // Check if there are any existing dues bills for this community with due date set to the last day of the current month
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const year = lastDay.getFullYear();
      const month = String(lastDay.getMonth() + 1).padStart(2, "0");
      const date = String(lastDay.getDate()).padStart(2, "0");
      const dueDateString = `${year}-${month}-${date}`;

      const { data: existingBills } = await supabase
        .from("dues_bills")
        .select("*")
        .eq("community_id", targetComm.id)
        .eq("due_date", dueDateString);

      if (existingBills && existingBills.length > 0) {
        // Find the recurring dues pocket for this community
        const { data: dbPockets } = await supabase
          .from("fund_pockets")
          .select("id, name")
          .eq("community_id", targetComm.id);

        let recurringDuesPocketId = null;
        if (dbPockets) {
          const found = dbPockets.find((p: any) =>
            p.name.toLowerCase().includes("recurring dues")
          );
          if (found) {
            recurringDuesPocketId = found.id;
          }
        }

        const refBill = existingBills[0];
        const { error: duesBillError } = await supabase
          .from("dues_bills")
          .insert({
            community_id: targetComm.id,
            profile_id: currentUser.id,
            title: refBill.title || "Iuran Wajib",
            amount: refBill.amount || 50000,
            due_date: dueDateString,
            status: "unpaid",
            pocket_id: recurringDuesPocketId || refBill.pocket_id,
          });

        if (duesBillError) {
          console.error("Gagal mencatat tagihan iuran awal saat bergabung:", duesBillError);
        }
      }

      // 3. Fetch pockets for this joined community
      const { data: targetPockets } = await supabase
        .from("fund_pockets")
        .select("*")
        .eq("community_id", targetComm.id);

      const mappedPockets: Pocket[] = (targetPockets || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        balance: Number(p.balance),
        tone: "primary",
      }));

      // 4. Fetch all members in this community to update the local list
      const { data: communityMembersList } = await supabase
        .from("community_members")
        .select(`
          role,
          profile:profiles (
            id,
            full_name,
            phone
          )
        `)
        .eq("community_id", targetComm.id);

      const mappedMembers: Member[] = (communityMembersList || [])
        .filter((m: any) => m.profile !== null)
        .map((m: any) => ({
          id: m.profile.id,
          name: m.profile.full_name || "Anonymous Warga",
          phone: m.profile.phone || "-",
          role: m.role === "admin" ? "Admin" : "Member",
          iuranStatus: "Lunas",
        }));

      // 5. Update local states
      const newComm: Community = {
        id: targetComm.id,
        name: targetComm.name,
        type: targetComm.type,
        role: "Member",
        logoColor: "bg-amber-600",
        primaryColor: targetComm.primary_color || "#6366f1",
        description: targetComm.description || "",
        logoName: targetComm.logo_url || undefined,
        inviteCode: targetComm.invite_code || undefined,
      };

      setCommunities([...communities, newComm]);
      setPockets({
        ...pockets,
        [targetComm.id]: mappedPockets,
      });
      setTransactions({ ...transactions, [targetComm.id]: [] });
      setEvents({ ...events, [targetComm.id]: [] });
      setDiscussions({ ...discussions, [targetComm.id]: [] });
      setMembers({
        ...members,
        [targetComm.id]: mappedMembers,
      });

      setJoinCode("");
      setIsJoinCommOpen(false);
      setSelectedCommunityId(targetComm.id);
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  const handleAddPocket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunityId || !newPocketName.trim()) return;

    try {
      const pocketBalVal = parseFloat(newPocketBalance) || 0;

      // Insert pocket in Supabase
      const { data: newPocketData, error: pocketError } = await supabase
        .from("fund_pockets")
        .insert({
          community_id: selectedCommunityId,
          name: newPocketName,
          balance: pocketBalVal,
        })
        .select()
        .single();

      if (pocketError || !newPocketData) {
        alert(`Gagal menambah kantong: ${pocketError?.message}`);
        return;
      }

      const newPocket: Pocket = {
        id: newPocketData.id,
        name: newPocketData.name,
        balance: Number(newPocketData.balance),
        tone: newPocketTone,
      };

      setPockets({
        ...pockets,
        [selectedCommunityId]: [...(pockets[selectedCommunityId] || []), newPocket],
      });

      if (newPocket.balance > 0) {
        // Record initial balance transaction
        const { data: initTx } = await supabase
          .from("transactions")
          .insert({
            community_id: selectedCommunityId,
            pocket_id: newPocket.id,
            profile_id: currentUser?.id,
            type: "income",
            amount: newPocket.balance,
            description: `Saldo Awal — ${newPocket.name}`,
            status: "success",
          })
          .select(`
            *,
            fund_pockets (name),
            profiles (full_name)
          `)
          .single();

        if (initTx) {
          const newTx: Transaction = {
            id: initTx.id,
            name: initTx.description,
            pocket: initTx.fund_pockets?.name || newPocket.name,
            amount: Number(initTx.amount),
            type: "in",
            date: "Hari ini",
            author: profileName,
          };
          setTransactions({
            ...transactions,
            [selectedCommunityId]: [newTx, ...(transactions[selectedCommunityId] || [])],
          });
        }
      }

      setNewPocketName("");
      setNewPocketBalance("");
      setNewPocketTone("primary");
      setIsAddPocketOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunityId || !txDesc.trim() || !txAmount || !txPocketId || !currentUser) return;

    const amount = parseFloat(txAmount) || 0;
    const targetPocket = pockets[selectedCommunityId]?.find((p) => p.id === txPocketId);
    if (!targetPocket) return;

    if (txType === "out" && targetPocket.balance < amount) {
      alert("Saldo kantong tidak mencukupi untuk melakukan pengeluaran ini!");
      return;
    }

    try {
      // 1. Insert transaction in Supabase
      const { data: newTxData, error: txError } = await supabase
        .from("transactions")
        .insert({
          community_id: selectedCommunityId,
          pocket_id: txPocketId,
          profile_id: currentUser.id,
          type: txType === "in" ? "income" : "expense",
          amount: amount,
          description: txDesc,
          status: "success",
        })
        .select(`
          *,
          fund_pockets (name),
          profiles (full_name)
        `)
        .single();

      if (txError || !newTxData) {
        alert(`Gagal menyimpan transaksi: ${txError?.message}`);
        return;
      }

      // 2. Update pocket balance in Supabase
      const newBal = targetPocket.balance + (txType === "in" ? amount : -amount);
      const { error: pocketError } = await supabase
        .from("fund_pockets")
        .update({ balance: newBal })
        .eq("id", txPocketId);

      if (pocketError) {
        console.error("Gagal update saldo kantong:", pocketError);
      }

      // 3. Update local states
      const updatedPockets = pockets[selectedCommunityId].map((p) => {
        if (p.id === txPocketId) {
          return { ...p, balance: newBal };
        }
        return p;
      });

      setPockets({
        ...pockets,
        [selectedCommunityId]: updatedPockets,
      });

      const newTx: Transaction = {
        id: newTxData.id,
        name: newTxData.description,
        pocket: newTxData.fund_pockets?.name || targetPocket.name,
        amount: Number(newTxData.amount),
        type: txType,
        date: "Hari ini",
        author: profileName,
      };

      setTransactions({
        ...transactions,
        [selectedCommunityId]: [newTx, ...(transactions[selectedCommunityId] || [])],
      });

      setTxDesc("");
      setTxAmount("");
      setIsAddTxOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Terjadi kesalahan: ${err.message}`);
    }
  };

  const handleRSVP = async (eventId: string, rsvp: "yes" | "no") => {
    if (!selectedCommunityId || !currentUser) return;

    const currentList = getEvents();
    const ev = currentList.find((e) => e.id === eventId);
    if (!ev) return;

    // Block re-vote if already answered
    if (ev.userRSVP !== "none") {
      Swal.fire({
        title: "Konfirmasi Sudah Terkunci",
        text: "Kehadiran kamu sudah tercatat dan tidak dapat diubah.",
        icon: "info",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
        confirmButtonText: "Mengerti",
      });
      return;
    }

    // Confirm dialog
    const label = rsvp === "yes" ? "✓ Hadir" : "✗ Tidak Hadir";
    const confirm = await Swal.fire({
      title: "Konfirmasi Kehadiran",
      html: `Kamu akan memilih <strong>${label}</strong> untuk acara <strong>${ev.title}</strong>.<br/><br/><span style="color:#ef4444;font-size:12px">⚠️ Pilihan ini tidak dapat diubah setelah dikonfirmasi.</span>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: rsvp === "yes" ? (activeCommunity?.primaryColor || "#6366f1") : "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: label,
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    const dbStatus = rsvp === "yes" ? "attending" : "absent";

    // Optimistic local update
    const updatedEvents = currentList.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          userRSVP: rsvp,
          rsvpYesCount: rsvp === "yes" ? e.rsvpYesCount + 1 : e.rsvpYesCount,
          rsvpNoCount: rsvp === "no" ? e.rsvpNoCount + 1 : e.rsvpNoCount,
        };
      }
      return e;
    });
    setEvents({ ...events, [selectedCommunityId]: updatedEvents });

    try {
      const res = await fetch("/api/event/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          profile_id: currentUser.id,
          status: rsvp,
          community_id: selectedCommunityId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal mencatat kehadiran.");
      }

      // Reload events to sync database state
      await fetchEvents(selectedCommunityId, currentUser.id);

      // Reload unpaid dues to get the new ticket bill
      await fetchMyUnpaidDues(selectedCommunityId, currentUser.id);

    } catch (err: any) {
      console.error("Error in handleRSVP:", err);
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal mencatat kehadiran. Silakan coba lagi.",
        icon: "error",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
      // Revert local state to match DB
      await fetchEvents(selectedCommunityId, currentUser.id);
    }
  };


  const handlePaymentSuccess = async () => {
    if (!selectedCommunityId || !currentUser) return;

    try {
      // Find the recurring dues pocket or the pocket associated with the specific bill
      const communityPockets = pockets[selectedCommunityId] || [];
      let duesPocket = communityPockets.find(p => p.name.toLowerCase().includes("dues") || p.name.toLowerCase().includes("iuran")) || communityPockets[0];

      if (selectedBillToPay && selectedBillToPay.pocket_id) {
        duesPocket = communityPockets.find(p => p.id === selectedBillToPay.pocket_id) || duesPocket;
      }

      const amount = selectedBillToPay ? Number(selectedBillToPay.amount) : 50000;
      const methodLabel = selectedPaymentChannel ? ` via ${selectedPaymentChannel}` : "";
      const description = selectedBillToPay
        ? `${selectedBillToPay.title} oleh ${profileName} (Lunas${methodLabel})`
        : `Iuran bulanan masuk dari ${profileName} (Lunas${methodLabel})`;

      if (duesPocket) {
        const newBal = duesPocket.balance + amount;

        // 1. Insert transaction
        const { data: newTxData, error: txError } = await supabase
          .from("transactions")
          .insert({
            community_id: selectedCommunityId,
            pocket_id: duesPocket.id,
            profile_id: currentUser.id,
            type: "income",
            amount: amount,
            description: description,
            status: "success",
          })
          .select(`
            *,
            fund_pockets (name),
            profiles (full_name)
          `)
          .single();

        if (txError) {
          console.error("Gagal mencatat transaksi iuran:", txError);
        }

        // 2. Update pocket balance
        await supabase
          .from("fund_pockets")
          .update({ balance: newBal })
          .eq("id", duesPocket.id);

        // 3. Update local pocket states
        const updatedPockets = communityPockets.map((p) => {
          if (p.id === duesPocket.id) {
            return { ...p, balance: newBal };
          }
          return p;
        });
        setPockets({
          ...pockets,
          [selectedCommunityId]: updatedPockets,
        });

        // 4. Update local transaction states
        if (newTxData) {
          const newTx: Transaction = {
            id: newTxData.id,
            name: newTxData.description,
            pocket: newTxData.fund_pockets?.name || duesPocket.name,
            amount: Number(newTxData.amount),
            type: "in",
            date: "Hari ini",
            author: profileName,
          };
          setTransactions({
            ...transactions,
            [selectedCommunityId]: [newTx, ...(transactions[selectedCommunityId] || [])],
          });
        }
      }

      // Update bill in DB if a specific bill was being paid
      if (selectedBillToPay) {
        const { error: billUpdateErr } = await supabase
          .from("dues_bills")
          .update({ status: "paid" })
          .eq("id", selectedBillToPay.id);

        if (billUpdateErr) {
          console.error("Gagal memperbarui status tagihan iuran:", billUpdateErr);
        }

        // Refresh unpaid dues list
        await fetchMyUnpaidDues(selectedCommunityId, currentUser.id);

        // If this is an arisan round bill, let's refresh arisan rounds/bills from DB
        await fetchArisanRounds(selectedCommunityId);
      }

      // Update member payment status (if paying monthly/recurring dues)
      const isRecurringBill = selectedBillToPay
        ? (selectedBillToPay.title.toLowerCase().includes("perdana") || selectedBillToPay.title.toLowerCase().includes("bulanan") || selectedBillToPay.title.toLowerCase().includes("recurring"))
        : true;

      if (isRecurringBill) {
        const updatedMembers = (members[selectedCommunityId] || []).map((m) => {
          if (m.name === profileName) {
            return { ...m, iuranStatus: "Lunas" as const };
          }
          return m;
        });
        setMembers({
          ...members,
          [selectedCommunityId]: updatedMembers,
        });
      }

      Swal.fire({
        title: "Pembayaran Berhasil",
        text: `Pembayaran sebesar Rp ${amount.toLocaleString("id-ID")} via ${selectedPaymentChannel || "QRIS"} berhasil diproses!`,
        icon: "success",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });

      setIsPaymentOpen(false);
      setSelectedBillToPay(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunityId || !currentUser || !newEventTitle.trim() || !newEventDate) return;

    setIsCreatingEvent(true);
    try {
      const price = parseFloat(newEventPrice) || 0;

      // 1. Insert event to DB
      const { data: newEvData, error: evErr } = await supabase
        .from("events")
        .insert({
          community_id: selectedCommunityId,
          title: newEventTitle,
          description: newEventDesc,
          location: newEventLocation,
          event_date: new Date(newEventDate).toISOString(),
          price: price,
          pocket_id: newEventPocketId || null,
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (evErr || !newEvData) {
        Swal.fire({ title: "Gagal", text: `Gagal membuat agenda: ${evErr?.message}`, icon: "error", confirmButtonColor: activeCommunity?.primaryColor || "#6366f1" });
        return;
      }

      // 2. Reload events and reset form
      await fetchEvents(selectedCommunityId, currentUser.id);

      setNewEventTitle("");
      setNewEventDesc("");
      setNewEventLocation("");
      setNewEventWhen("");
      setNewEventDate("");
      setNewEventPrice("0");
      setNewEventPocketId("");
      setIsCreateEventOpen(false);

      Swal.fire({
        title: "Acara Dibuat!",
        text: `"${newEventTitle}" berhasil ditambahkan ke agenda komunitas.`,
        icon: "success",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({ title: "Kesalahan", text: err.message, icon: "error", confirmButtonColor: activeCommunity?.primaryColor || "#6366f1" });
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunityId || !newThreadTitle.trim()) return;

    const newDisc: Discussion = {
      id: `disc-${Date.now()}`,
      title: newThreadTitle,
      author: profileName,
      comments: [],
      hot: false,
    };

    setDiscussions({
      ...discussions,
      [selectedCommunityId]: [newDisc, ...getDiscussions()],
    });

    setNewThreadTitle("");
    setActiveDiscussionId(newDisc.id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunityId || !activeDiscussionId || !newCommentContent.trim()) return;

    const updatedDiscussions = getDiscussions().map((d) => {
      if (d.id === activeDiscussionId) {
        return {
          ...d,
          comments: [
            ...d.comments,
            {
              author: profileName,
              content: newCommentContent,
              date: "Baru saja",
            },
          ],
        };
      }
      return d;
    });

    setDiscussions({
      ...discussions,
      [selectedCommunityId]: updatedDiscussions,
    });

    setNewCommentContent("");
  };

  const handleToggleMemberRole = async (memberId: string) => {
    if (!selectedCommunityId) return;

    const targetMember = members[selectedCommunityId]?.find((m) => m.id === memberId);
    if (!targetMember) return;

    const newRoleDb = targetMember.role === "Admin" ? "member" : "admin";

    try {
      const { error } = await supabase
        .from("community_members")
        .update({ role: newRoleDb })
        .eq("community_id", selectedCommunityId)
        .eq("profile_id", memberId);

      if (error) {
        alert(`Gagal memperbarui peran: ${error.message}`);
        return;
      }

      const updatedMembers = members[selectedCommunityId].map((m) => {
        if (m.id === memberId) {
          return { ...m, role: m.role === "Admin" ? ("Member" as const) : ("Admin" as const) };
        }
        return m;
      });

      setMembers({
        ...members,
        [selectedCommunityId]: updatedMembers,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCopyInviteCode = () => {
    if (!activeCommunity) return;
    const realCode = activeCommunity.inviteCode;

    if (!realCode) {
      alert("Gagal menyalin kode undangan: kode tidak ditemukan!");
      return;
    }

    navigator.clipboard.writeText(realCode);
    alert(`Kode undangan "${realCode}" berhasil disalin! Bagikan ke warga.`);
  };

  const runArisanKocok = async () => {
    const activeRound = arisanRounds.find(r => r.status === 'pending');
    if (!activeRound) {
      Swal.fire({
        title: "Peringatan",
        text: "Tidak ada putaran arisan yang aktif saat ini!",
        icon: "warning",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
      return;
    }

    setIsDrawingArisan(true);
    setArisanWinner(null);

    const activeMembers = members[selectedCommunityId || ""] || [];
    const wonProfileIds = arisanRounds
      .filter(r => r.winner_profile_id !== null)
      .map(r => r.winner_profile_id);

    // Filter candidates who haven't won yet
    const drawCandidates = activeMembers.filter((m) => !wonProfileIds.includes(m.id));

    const winner = drawCandidates.length > 0
      ? drawCandidates[Math.floor(Math.random() * drawCandidates.length)]
      : null;
    const winnerName = winner ? winner.name : "Bu Sari";
    const winnerId = winner ? winner.id : null;

    setTimeout(async () => {
      setArisanWinner(winnerName);
      setIsDrawingArisan(false);

      if (selectedCommunityId && currentUser && winnerId) {
        try {
          const res = await fetch("/api/arisan/draw", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              round_id: activeRound.id,
              winner_id: winnerId,
              community_id: selectedCommunityId,
              profile_id: currentUser.id,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Gagal mencatat pemenang arisan.");
          }

          // Update arisan history state
          setArisanHistory({
            ...arisanHistory,
            [selectedCommunityId]: [`${winnerName} (Putaran ${activeRound.round_number})`, ...(arisanHistory[selectedCommunityId] || [])],
          });

          // Refresh arisan rounds from Supabase to update the UI
          await fetchArisanRounds(selectedCommunityId);

          // Reload fund pockets balances
          const { data: pocketsList } = await supabase
            .from("fund_pockets")
            .select("*")
            .eq("community_id", selectedCommunityId);
          if (pocketsList) {
            const mapped = pocketsList.map(p => ({
              id: p.id,
              name: p.name,
              balance: Number(p.balance),
              tone: "primary" as const
            }));
            setPockets({ ...pockets, [selectedCommunityId]: mapped });
          }

          // Reload transactions history
          const { data: allTxs } = await supabase
            .from("transactions")
            .select(`
              *,
              fund_pockets (name),
              profiles (full_name)
            `)
            .eq("community_id", selectedCommunityId)
            .order("created_at", { ascending: false });

          if (allTxs) {
            const txList = allTxs.map(t => ({
              id: t.id,
              name: t.description,
              pocket: t.fund_pockets?.name || "Treasury",
              amount: Number(t.amount),
              type: (t.type === "income" ? "in" : "out") as "in" | "out",
              date: new Date(t.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric"
              }),
              author: t.profiles?.full_name || "System"
            }));
            setTransactions({ ...transactions, [selectedCommunityId]: txList });
          }

        } catch (err: any) {
          console.error("Gagal memproses kocokan arisan:", err);
          Swal.fire({
            title: "Gagal",
            text: err.message || "Terjadi kesalahan saat memproses kocokan.",
            icon: "error",
            confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
          });
        }
      }
    }, 2500);
  };


  const handleCreateMonthlyDues = async () => {
    if (!selectedCommunityId || !currentUser) return;

    const nextDetails = getNextDuesMonthDetails();
    const nextMonthName = INDO_MONTHS[nextDetails.month - 1];
    const nextYear = nextDetails.year;

    const result = await Swal.fire({
      title: "Buat Iuran Bulanan",
      text: `Apakah Anda yakin ingin membuat iuran bulanan untuk seluruh warga di bulan ${nextMonthName} ${nextYear}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Buat",
      cancelButtonText: "Batal",
      confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
    });

    if (!result.isConfirmed) return;

    try {
      // 1. Fetch all members of the community from Supabase
      const { data: cms, error: cmsErr } = await supabase
        .from("community_members")
        .select("profile_id")
        .eq("community_id", selectedCommunityId);

      if (cmsErr) {
        throw new Error(`Gagal mengambil anggota komunitas: ${cmsErr.message}`);
      }

      if (!cms || cms.length === 0) {
        throw new Error("Tidak ada anggota di komunitas ini.");
      }

      // 2. Find the Recurring Dues pocket
      const { data: pocketsList } = await supabase
        .from("fund_pockets")
        .select("*")
        .eq("community_id", selectedCommunityId);

      const communityPockets = pocketsList || [];
      const duesPocket = communityPockets.find((p: any) =>
        p.name.toLowerCase().includes("dues") || p.name.toLowerCase().includes("iuran")
      ) || communityPockets[0];

      const pocketId = duesPocket?.id || null;

      // 3. Get the last day of the new month
      const dueDate = getLastDayOfMonth(nextYear, nextDetails.month);

      // 4. Build bills array
      const billsToInsert = cms.map((cm) => ({
        community_id: selectedCommunityId,
        profile_id: cm.profile_id,
        pocket_id: pocketId,
        title: `Iuran Bulanan ${nextMonthName} ${nextYear}`,
        amount: 50000,
        due_date: dueDate,
        status: "unpaid"
      }));

      // 5. Insert bills into Supabase
      const { error: insertErr } = await supabase
        .from("dues_bills")
        .insert(billsToInsert);

      if (insertErr) {
        throw new Error(`Gagal membuat tagihan: ${insertErr.message}`);
      }

      Swal.fire({
        title: "Sukses",
        text: `Iuran bulanan ${nextMonthName} ${nextYear} berhasil dibuat untuk seluruh warga.`,
        icon: "success",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });

      // 6. Refresh data
      await fetchLastDuesBill(selectedCommunityId, currentUser.id);
      await fetchCommunityDuesBills(selectedCommunityId);
      await fetchMyUnpaidDues(selectedCommunityId, currentUser.id);

    } catch (err: any) {
      console.error("Gagal membuat iuran bulanan:", err);
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal membuat iuran bulanan.",
        icon: "error",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
    }
  };

  const handleToggleIuranStatus = async (billId: string) => {
    try {
      const targetBill = communityDuesBills.find((b) => b.id === billId);
      if (!targetBill) return;

      const newStatus = targetBill.status === "unpaid" ? "paid" : "unpaid";

      // 1. Update in Supabase
      const { error } = await supabase
        .from("dues_bills")
        .update({ status: newStatus })
        .eq("id", billId);

      if (error) {
        throw error;
      }

      // 2. Perform treasury pocket updates & transaction record log if it is marked as paid
      if (newStatus === "paid" && selectedCommunityId) {
        const communityPockets = pockets[selectedCommunityId] || [];
        const duesPocket = communityPockets.find(p => p.name.toLowerCase().includes("dues") || p.name.toLowerCase().includes("iuran")) || communityPockets[0];
        const amount = Number(targetBill.amount);

        if (duesPocket) {
          const newBal = duesPocket.balance + amount;

          // Update local pocket state
          const updatedPockets = communityPockets.map((p) => {
            if (p.id === duesPocket.id) {
              return { ...p, balance: newBal };
            }
            return p;
          });
          setPockets(prev => ({
            ...prev,
            [selectedCommunityId]: updatedPockets,
          }));

          // Insert transaction in Supabase
          await supabase.from("transactions").insert({
            community_id: selectedCommunityId,
            pocket_id: duesPocket.id,
            profile_id: targetBill.profile_id,
            type: "income",
            amount: amount,
            description: `${targetBill.title} (Lunas)`,
            status: "success",
          });

          // Update pocket balance in Supabase
          await supabase
            .from("fund_pockets")
            .update({ balance: newBal })
            .eq("id", duesPocket.id);
        }
      }

      // 3. Refresh list from Supabase
      if (selectedCommunityId) {
        await fetchCommunityDuesBills(selectedCommunityId);
        if (currentUser?.id) {
          await fetchMyUnpaidDues(selectedCommunityId, currentUser.id);
        }
      }

      Swal.fire({
        title: "Sukses",
        text: `Status tagihan berhasil diubah menjadi ${newStatus === "paid" ? "Lunas" : "Menunggak"}.`,
        icon: "success",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
    } catch (err: any) {
      console.error("Gagal mengubah status tagihan:", err);
      Swal.fire({
        title: "Gagal",
        text: err.message || "Gagal mengubah status tagihan.",
        icon: "error",
        confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
      });
    }
  };

  const handleSendBillReminder = (name: string, phone: string) => {
    alert(`Pengingat tagihan iuran bulanan sebesar Rp 50.000 berhasil dikirim ke WhatsApp ${name} (${phone})!`);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profil berhasil diperbarui di database!");
  };

  const handleSimulateUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setNewCommLogoName(file.name);
      }
    };
    fileInput.click();
  };

  const getDiscussions = () => {
    const list = discussions[selectedCommunityId || ""] || [];
    if (list.length === 0) {
      return [
        {
          id: "d-default-1",
          title: "Evaluasi Kerja Bakti Minggu Lalu",
          author: "Sari (Bendahara)",
          hot: true,
          comments: [
            { author: "Budi", content: "Terima kasih untuk warga yang sudah menyumbang tenaga dan konsumsi kemarin. Hasilnya saluran air sudah bersih.", date: "1 hari lalu" },
            { author: "Adit", content: "Saran untuk kerja bakti berikutnya, kita perlu siapkan obat antinyamuk bubuk.", date: "12 jam lalu" },
          ],
        },
        {
          id: "d-default-2",
          title: "Saran Menu Konsumsi Pertemuan Warga",
          author: "Adit",
          hot: false,
          comments: [
            { author: "Sari", content: "Bagaimana kalau kita pesan nasi kotak sederhana saja?", date: "2 jam lalu" },
          ],
        },
      ];
    }
    return list;
  };

  const getEvents = () => {
    return events[selectedCommunityId || ""] || [];
  };

  // Calculations
  const totalBalance = activeCommunity
    ? (pockets[activeCommunity.id] || []).reduce((acc, curr) => acc + curr.balance, 0)
    : 0;

  const activeCommunityMembers = activeCommunity ? (members[activeCommunity.id] || []) : [];
  const myMemberInfo = activeCommunityMembers.find((m) => m.name === profileName);
  const myRole = myMemberInfo?.role || activeCommunity?.role || "Member";
  const myIuranPaid = myMemberInfo?.iuranStatus === "Lunas";

  const totalPaidMembers = activeCommunityMembers.filter((m) => m.iuranStatus === "Lunas").length;
  const payPercentage = activeCommunityMembers.length > 0
    ? Math.round((totalPaidMembers / activeCommunityMembers.length) * 100)
    : 0;

  // --- Premium Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-zinc-500">Memuat data komunitas Kyklos Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">

      {/* --- STATE 1: LANDING DASHBOARD (No community selected yet) --- */}
      {selectedCommunityId === null && (
        <>
          {/* Mobile Top Bar */}
          <header className="md:hidden flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-6 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <Sparkles className="h-4.5 w-4.5" strokeWidth={2.25} />
              </div>
              <span className="text-base font-bold tracking-tight text-zinc-900">Kyklos</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </header>

          {/* SIDEBAR FOR LANDING VIEW */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200/80 bg-white p-5 flex flex-col justify-between transition-transform duration-350 md:sticky md:translate-x-0 md:h-screen ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
            <div className="space-y-6">
              {/* Close button for Mobile Sidebar */}
              <div className="flex items-center justify-between md:hidden pb-2 border-b border-zinc-100">
                <span className="text-sm font-bold text-zinc-500">Menu Utama</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-zinc-650">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Brand Logo Kyklos */}
              <div className="flex items-center gap-2 px-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" strokeWidth={2.25} />
                </div>
                <span className="text-lg font-extrabold tracking-tight text-zinc-900">Kyklos</span>
              </div>

              {/* User Info */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3.5 space-y-1">
                <div className="text-xs font-bold text-zinc-900 truncate">{profileName}</div>
                <div className="text-[10px] text-zinc-400 font-medium">Pengguna Kyklos</div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <button
                  onClick={() => { setLandingTab("communities"); setMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all ${landingTab === "communities"
                    ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600"
                    : "text-zinc-600 hover:text-indigo-600 hover:bg-zinc-50"
                    }`}
                >
                  <Building className="h-4.5 w-4.5" />
                  Komunitas Saya
                </button>

                <button
                  onClick={() => { setLandingTab("profile"); setMobileMenuOpen(false); }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all ${landingTab === "profile"
                    ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600"
                    : "text-zinc-600 hover:text-indigo-600 hover:bg-zinc-50"
                    }`}
                >
                  <User className="h-4.5 w-4.5" />
                  Profil Saya
                </button>
              </nav>
            </div>

            {/* Logout Bottom */}
            <div className="pt-4 border-t border-zinc-100">
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-500 hover:text-red-650 hover:bg-red-50 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar Aplikasi
              </Button>
            </div>
          </aside>

          {/* Backdrop for Mobile */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Right Side Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
              {/* SUB-VIEW 1: COMMUNITIES LIST */}
              {landingTab === "communities" && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                        Daftar Komunitas Saya
                      </h1>
                      <p className="mt-2 text-sm text-zinc-500 max-w-md">
                        Pilih komunitas yang ingin Anda buka atau kelola untuk memantau dana dan agenda bersama.
                      </p>
                    </div>
                    {communities.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                          onClick={() => setIsJoinCommOpen(true)}
                        >
                          Gabung Komunitas
                        </Button>
                        <Button
                          className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                          onClick={() => setIsCreateCommOpen(true)}
                        >
                          <Plus className="mr-1.5 h-4 w-4" />
                          Buat Komunitas Baru
                        </Button>
                      </div>
                    )}
                  </div>

                  {communities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-6 max-w-md mx-auto border border-zinc-150 rounded-2xl bg-white/50 shadow-xs mt-10 animate-fade-in">
                      <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-650 border border-indigo-100 shadow-sm animate-pulse">
                        <Building className="h-8 w-8" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Belum Ada Komunitas</h2>
                        <p className="text-xs text-zinc-505 leading-relaxed">
                          Anda belum bergabung atau membuat komunitas apapun. Silakan buat komunitas baru sebagai admin atau masukkan kode undangan untuk bergabung dengan komunitas yang sudah ada.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 h-10 text-xs font-bold"
                          onClick={() => setIsJoinCommOpen(true)}
                        >
                          Gabung Komunitas
                        </Button>
                        <Button
                          className="w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 h-10 text-xs font-bold"
                          onClick={() => setIsCreateCommOpen(true)}
                        >
                          <Plus className="mr-1.5 h-4 w-4" />
                          Buat Komunitas Baru
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Communities Grid */
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {communities.map((comm) => {
                        const commPockets = pockets[comm.id] || [];
                        const pocketsCount = commPockets.length;
                        const balanceTotal = commPockets.reduce((sum, p) => sum + p.balance, 0);
                        const commRole = members[comm.id]?.find((m) => m.name === profileName)?.role || comm.role;

                        return (
                          <Card
                            key={comm.id}
                            className="group border border-zinc-200 bg-white rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[180px]"
                            onClick={() => setSelectedCommunityId(comm.id)}
                          >
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                {comm.logoName ? (
                                  <div className="h-11 w-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm overflow-hidden text-xs">
                                    {comm.logoName.substring(0, 5)}...
                                  </div>
                                ) : (
                                  <div
                                    className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                    style={{ backgroundColor: comm.primaryColor }}
                                  >
                                    {comm.name.charAt(0)}
                                  </div>
                                )}
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${commRole === "Admin" ? "bg-red-50 text-red-655" : "bg-emerald-50 text-emerald-700"
                                  }`}>
                                  {commRole}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-655 transition-colors">
                                  {comm.name}
                                </h3>
                                <p className="text-xs text-zinc-405 mt-0.5 capitalize">{comm.type}</p>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-505">
                              <span>{pocketsCount} Kantong Dana</span>
                              <span className="font-semibold text-zinc-700">
                                Rp {balanceTotal.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-VIEW 2: PROFILE SETTINGS */}
              {landingTab === "profile" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Profil Saya</h1>
                    <p className="mt-1.5 text-sm text-zinc-500">Kelola informasi pribadi Anda di platform Kyklos.</p>
                  </div>

                  <Card className="rounded-2xl border border-zinc-200/80 p-6 bg-white max-w-xl shadow-sm">
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <div className="flex items-center gap-4 border-b border-zinc-100 pb-5">
                        <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl border border-indigo-200">
                          {profileName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-zinc-900">{profileName}</h3>
                          <p className="text-xs text-zinc-455 mt-0.5">Dibuat: Baru saja</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="prof-name">Nama Lengkap</Label>
                        <Input
                          id="prof-name"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="prof-phone">No. WhatsApp / HP</Label>
                        <Input
                          id="prof-phone"
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="prof-email">Alamat Email</Label>
                        <Input
                          id="prof-email"
                          type="email"
                          required
                          value={profileEmail}
                          disabled
                          className="bg-zinc-50 text-zinc-450 cursor-not-allowed"
                        />
                      </div>

                      <div className="pt-2">
                        <Button type="submit" className="w-full sm:w-auto px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                          Simpan Perubahan
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}

            </main>
          </div>
        </>
      )}

      {/* --- STATE 2: ACTIVE COMMUNITY DASHBOARD (Sidebar + Page Switcher) --- */}
      {selectedCommunityId !== null && activeCommunity && (
        <>
          {/* Mobile Top Bar */}
          <header className="md:hidden flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-6 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              {activeCommunity.logoName ? (
                <div className="h-8 w-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-[8px] border border-white/10 shadow-sm shrink-0 overflow-hidden">
                  {activeCommunity.logoName.substring(0, 3)}..
                </div>
              ) : (
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: activeCommunity.primaryColor }}
                >
                  {activeCommunity.name.charAt(0)}
                </div>
              )}
              <span className="text-base font-bold text-zinc-900 truncate max-w-[150px]">
                {activeCommunity.name}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </header>

          {/* SIDEBAR (Desktop Layout) */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200/80 bg-white p-5 flex flex-col justify-between transition-transform duration-350 md:sticky md:translate-x-0 md:h-screen ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
            <div className="space-y-6">
              {/* Close button for Mobile Sidebar */}
              <div className="flex items-center justify-between md:hidden pb-2 border-b border-zinc-100">
                <span className="text-sm font-bold text-zinc-500">Navigasi Komunitas</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-zinc-655">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Top Section: Community Logo & Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {activeCommunity.logoName ? (
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] shadow-sm shrink-0 overflow-hidden p-1 text-center leading-tight">
                      {activeCommunity.logoName.substring(0, 5)}...
                    </div>
                  ) : (
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0"
                      style={{ backgroundColor: activeCommunity.primaryColor }}
                    >
                      {activeCommunity.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-zinc-955 truncate leading-snug">{activeCommunity.name}</h2>
                    <span className="text-[10px] text-zinc-400 font-medium capitalize">{activeCommunity.type}</span>
                  </div>
                </div>

                {/* User mini info & role */}
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3 space-y-2">
                  <div className="text-xs">
                    <div className="font-semibold text-zinc-900 truncate">{profileName}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Anggota Aktif</div>
                  </div>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold ${myRole === "Admin" ? "bg-red-50 text-red-655 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}>
                    {myRole === "Admin" ? "Admin" : "Member"}
                  </span>
                </div>

                {/* Ganti Komunitas Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCommunityId(null);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-xl border-zinc-200 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 h-9 justify-start"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Ganti Komunitas
                </Button>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <button
                  onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: activeTab === "dashboard" ? `${activeCommunity.primaryColor}10` : "transparent",
                    color: activeTab === "dashboard" ? activeCommunity.primaryColor : "#52525b",
                    borderLeft: activeTab === "dashboard" ? `3px solid ${activeCommunity.primaryColor}` : "none",
                  }}
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  Dashboard
                </button>

                <button
                  onClick={() => { setActiveTab("wallet"); setMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: activeTab === "wallet" ? `${activeCommunity.primaryColor}10` : "transparent",
                    color: activeTab === "wallet" ? activeCommunity.primaryColor : "#52525b",
                    borderLeft: activeTab === "wallet" ? `3px solid ${activeCommunity.primaryColor}` : "none",
                  }}
                >
                  <Wallet className="h-4.5 w-4.5" />
                  Dompet & Iuran
                </button>

                <button
                  onClick={() => { setActiveTab("arisan"); setMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: activeTab === "arisan" ? `${activeCommunity.primaryColor}10` : "transparent",
                    color: activeTab === "arisan" ? activeCommunity.primaryColor : "#52525b",
                    borderLeft: activeTab === "arisan" ? `3px solid ${activeCommunity.primaryColor}` : "none",
                  }}
                >
                  <Trophy className="h-4.5 w-4.5" />
                  Arisan
                </button>

                <button
                  onClick={() => { setActiveTab("discussion"); setMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: activeTab === "discussion" ? `${activeCommunity.primaryColor}10` : "transparent",
                    color: activeTab === "discussion" ? activeCommunity.primaryColor : "#52525b",
                    borderLeft: activeTab === "discussion" ? `3px solid ${activeCommunity.primaryColor}` : "none",
                  }}
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  Forum Diskusi
                </button>

                <button
                  onClick={() => { setActiveTab("events"); setMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: activeTab === "events" ? `${activeCommunity.primaryColor}10` : "transparent",
                    color: activeTab === "events" ? activeCommunity.primaryColor : "#52525b",
                    borderLeft: activeTab === "events" ? `3px solid ${activeCommunity.primaryColor}` : "none",
                  }}
                >
                  <Calendar className="h-4.5 w-4.5" />
                  Agenda & Kegiatan
                </button>

                <button
                  onClick={() => { setActiveTab("members"); setMobileMenuOpen(false); }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all"
                  style={{
                    backgroundColor: activeTab === "members" ? `${activeCommunity.primaryColor}10` : "transparent",
                    color: activeTab === "members" ? activeCommunity.primaryColor : "#52525b",
                    borderLeft: activeTab === "members" ? `3px solid ${activeCommunity.primaryColor}` : "none",
                  }}
                >
                  <Users className="h-4.5 w-4.5" />
                  Anggota
                </button>
              </nav>
            </div>

            {/* Logout Bottom */}
            <div className="pt-4 border-t border-zinc-100">
              <Button
                variant="ghost"
                className="w-full justify-start text-zinc-500 hover:text-red-650 hover:bg-red-50 rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar Aplikasi
              </Button>
            </div>
          </aside>

          {/* Backdrop for Mobile */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* MAIN CONTAINER AREA */}
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">

              {/* --- VIEW: DASHBOARD SUMMARY --- */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  {/* Greeting & Quick Action */}
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                        Selamat Datang Kembali 👋
                      </h1>
                      <p className="mt-1.5 text-sm text-zinc-555">
                        Berikut ringkasan operasional dan keuangan **{activeCommunity.name}** hari ini.
                      </p>
                    </div>
                    {myRole === "Admin" && (
                      <Button
                        className="rounded-xl shadow-sm text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: activeCommunity.primaryColor }}
                        onClick={() => setIsAddTxOpen(true)}
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Catat Transaksi
                      </Button>
                    )}
                  </div>

                  {/* Description Info Banner if available */}
                  {activeCommunity.description && (
                    <Card className="p-4 border border-zinc-150 bg-white/50 rounded-2xl text-xs text-zinc-655 flex items-start gap-2">
                      <Info className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-zinc-800">Tentang Komunitas: </span>
                        {activeCommunity.description}
                      </div>
                    </Card>
                  )}

                  {/* Core Wallet Summary */}
                  <section className="space-y-4">
                    <h2 className="text-lg font-bold text-zinc-900">Dompet Utama</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="p-6 md:col-span-1 border border-zinc-200/80 bg-white rounded-2xl flex flex-col justify-between min-h-[140px] shadow-sm">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Total Saldo Bersama</span>
                          <div className="text-3xl font-black tracking-tight text-zinc-900">
                            Rp {totalBalance.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: activeCommunity.primaryColor }}>
                          <TrendingUp className="h-4 w-4" />
                          <span>+Rp 350.000 masuk bulan ini</span>
                        </div>
                      </Card>

                      <div className="md:col-span-2 grid gap-4 sm:grid-cols-3">
                        {(pockets[activeCommunity.id] || []).slice(0, 3).map((pocket) => (
                          <div
                            key={pocket.id}
                            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-zinc-455 uppercase tracking-wider truncate max-w-[100px]">{pocket.name}</span>
                              <span
                                className="rounded-full border px-2 py-0.5 text-[9px] font-bold"
                                style={{
                                  backgroundColor: `${activeCommunity.primaryColor}15`,
                                  color: activeCommunity.primaryColor,
                                  borderColor: `${activeCommunity.primaryColor}30`,
                                }}
                              >
                                POCKET
                              </span>
                            </div>
                            <div className="mt-4">
                              <div className="text-lg font-bold text-zinc-900">
                                Rp {pocket.balance.toLocaleString("id-ID")}
                              </div>
                              <span className="text-[10px] text-zinc-450 mt-0.5 block">Sisa dana aktif</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Split Ledger & Status */}
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Log Transaksi Terakhir */}
                    <Card className="lg:col-span-2 rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-bold text-zinc-900">Log Transaksi Terakhir</h2>
                          <p className="text-xs text-zinc-400">Catatan pengeluaran & pemasukan demi transparansi warga (Ledger)</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("wallet")}
                          className="rounded-xl text-xs text-zinc-500"
                        >
                          Lihat Mutasi
                        </Button>
                      </div>

                      <div className="mt-6 divide-y divide-zinc-100">
                        {(transactions[activeCommunity.id] || []).length === 0 ? (
                          <p className="text-center py-6 text-zinc-400 text-xs">Belum ada transaksi tercatat.</p>
                        ) : (
                          (transactions[activeCommunity.id] || []).slice(0, 4).map((t) => (
                            <div key={t.id} className="flex items-center justify-between py-3.5">
                              <div className="flex items-center gap-3">
                                <div className={`grid h-9 w-9 place-items-center rounded-xl ${t.type === "in" ? "bg-emerald-50 text-emerald-650 border border-emerald-100" : "bg-red-50 text-red-655 border border-red-100"
                                  }`}>
                                  {t.type === "in" ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-zinc-955">{t.name}</div>
                                  <div className="text-xs text-zinc-400 mt-0.5">
                                    {t.pocket} · <span className="font-medium text-zinc-555">{t.author}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-sm font-bold ${t.type === "in" ? "text-emerald-650" : "text-zinc-900"}`}>
                                  {t.type === "in" ? "+" : "−"} Rp {t.amount.toLocaleString("id-ID")}
                                </div>
                                <span className="text-[9px] text-zinc-400 block mt-0.5">{t.date}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>

                    {/* Status Iuran Side Panel */}
                    <div className="space-y-6">
                      <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white">
                        <h3 className="text-sm font-bold text-zinc-900">Persentase Iuran</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Bulan Juni berjalan</p>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-655">{payPercentage}% Warga Sudah Bayar</span>
                            <span className="text-zinc-900">{totalPaidMembers} / {activeCommunityMembers.length}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${payPercentage}%` }} />
                          </div>
                        </div>
                      </Card>

                      <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white flex flex-col justify-between min-h-[130px]">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">Status Saya</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">Iuran Bulanan</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-4">
                          {myIuranPaid ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 w-full text-xs font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Lunas</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs font-semibold shrink-0">
                                <Clock className="h-4 w-4" />
                                <span>Belum Bayar</span>
                              </div>
                              <Button
                                size="sm"
                                className="rounded-xl text-xs font-bold text-white hover:opacity-90 shrink-0"
                                style={{ backgroundColor: activeCommunity.primaryColor }}
                                onClick={() => setIsPaymentOpen(true)}
                              >
                                Bayar Kas
                              </Button>
                            </>
                          )}
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Arisan and Agenda widgets */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Arisan teaser */}
                    {activeCommunity.type.toLowerCase().includes("arisan") && (
                      <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-900">Kocokan Arisan</h3>
                            <Trophy className="h-4 w-4 text-amber-500" />
                          </div>
                          <div className="text-xs text-zinc-555 leading-relaxed">
                            Pot putaran ini sebesar **Rp 2.500.000**. Pemenang bulan lalu: **{arisanHistory[activeCommunity.id]?.[0]?.split(" ")[0] || "Bu Sari"}**.
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("arisan")}
                          className="mt-6 w-full rounded-xl text-xs font-semibold"
                        >
                          Buka Halaman Arisan
                        </Button>
                      </Card>
                    )}

                    {/* Events teaser */}
                    <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-zinc-900">Agenda Terdekat</h3>
                          <Calendar className="h-4 w-4 text-zinc-400" />
                        </div>
                        {events[activeCommunity.id]?.[0] ? (
                          <div className="text-xs text-zinc-550 space-y-1">
                            <div className="font-semibold text-zinc-800">{events[activeCommunity.id][0].title}</div>
                            <div>{events[activeCommunity.id][0].when}</div>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-400">Tidak ada agenda mendatang.</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("events")}
                        className="mt-6 w-full rounded-xl text-xs font-semibold"
                      >
                        Kelola Agenda Warga
                      </Button>
                    </Card>
                  </div>
                </div>
              )}

              {/* --- VIEW: WALLET & IURAN --- */}
              {activeTab === "wallet" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Dompet & Iuran</h1>
                      <p className="mt-1.5 text-sm text-zinc-500">Kelola kantong dana terpisah, tracking iuran bulanan, dan audit ledger keuangan.</p>
                    </div>
                  </div>

                  {/* Total Saldo Utama Banner */}
                  <Card className="p-6 border border-zinc-200 bg-white rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Saldo Utama (Kas Komunitas)</span>
                      <div className="text-3xl font-black tracking-tight text-zinc-900">
                        Rp {totalBalance.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 max-w-xs leading-relaxed bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                      💡 Dana ini terbagi ke dalam **{(pockets[activeCommunity.id] || []).length} kantong** alokasi dana secara real-time.
                    </div>
                  </Card>

                  {/* Sub-menu Tabs */}
                  <div className="border-b border-zinc-200 flex gap-6 text-sm font-semibold">
                    <button
                      onClick={() => setWalletTab("pockets")}
                      className="pb-3 transition-colors border-b-2"
                      style={{
                        borderColor: walletTab === "pockets" ? activeCommunity.primaryColor : "transparent",
                        color: walletTab === "pockets" ? activeCommunity.primaryColor : "#71717a",
                      }}
                    >
                      Kantong Dana & Mutasi
                    </button>
                    <button
                      onClick={() => setWalletTab("iuran")}
                      className="pb-3 transition-colors border-b-2"
                      style={{
                        borderColor: walletTab === "iuran" ? activeCommunity.primaryColor : "transparent",
                        color: walletTab === "iuran" ? activeCommunity.primaryColor : "#71717a",
                      }}
                    >
                      Pelacakan Iuran Anggota
                    </button>
                    <button
                      onClick={() => setWalletTab("my_iuran")}
                      className="pb-3 transition-colors border-b-2"
                      style={{
                        borderColor: walletTab === "my_iuran" ? activeCommunity.primaryColor : "transparent",
                        color: walletTab === "my_iuran" ? activeCommunity.primaryColor : "#71717a",
                      }}
                    >
                      Iuran Saya
                    </button>
                  </div>

                  {/* Sub-tab 1: Pockets & Ledger */}
                  {walletTab === "pockets" && (
                    <div className="space-y-8">
                      {/* Pockets Grid */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-zinc-900">Daftar Kantong Dana (Pockets)</h3>
                          {myRole === "Admin" && (
                            <Button
                              onClick={() => setIsAddPocketOpen(true)}
                              className="rounded-xl text-xs font-bold text-white hover:opacity-90"
                              style={{ backgroundColor: activeCommunity.primaryColor }}
                            >
                              <Plus className="mr-1.5 h-4 w-4" />
                              Tambah Kantong
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {(pockets[activeCommunity.id] || []).map((p) => (
                            <div key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col justify-between min-h-[120px]">
                              <div>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide block truncate">{p.name}</span>
                                <div className="text-xl font-black text-zinc-900 mt-2">
                                  Rp {p.balance.toLocaleString("id-ID")}
                                </div>
                              </div>
                              <span className="text-[10px] text-zinc-400 mt-4 block">Saldo Terpenuhi</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ledger History (Buku Kas Terbuka) */}
                      <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-zinc-900">Buku Kas Terbuka (Transparan)</h3>
                            <p className="text-xs text-zinc-400 mt-0.5">Catatan audit mutasi uang masuk (+) dan uang keluar (-) secara transparan</p>
                          </div>
                          {myRole === "Admin" && (
                            <Button
                              onClick={() => setIsAddTxOpen(true)}
                              variant="outline"
                              className="rounded-xl border-zinc-200 text-xs font-semibold text-zinc-655 h-9"
                            >
                              Catat Transaksi Manual
                            </Button>
                          )}
                        </div>
                        <div className="mt-6 divide-y divide-zinc-100">
                          {(transactions[activeCommunity.id] || []).length === 0 ? (
                            <p className="text-center py-8 text-zinc-400 text-xs">Belum ada mutasi kas tercatat di komunitas ini.</p>
                          ) : (
                            (transactions[activeCommunity.id] || []).map((t) => (
                              <div key={t.id} className="flex items-center justify-between py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${t.type === "in" ? "bg-emerald-50 text-emerald-650 border border-emerald-100" : "bg-red-50 text-red-655 border border-red-100"
                                    }`}>
                                    {t.type === "in" ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-zinc-955">
                                      {t.name}
                                    </div>
                                    <div className="text-xs text-zinc-400 mt-0.5">
                                      Kantong: <span className="font-semibold text-zinc-600">{t.pocket}</span> · oleh {t.author}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-sm font-bold ${t.type === "in" ? "text-emerald-600" : "text-red-600"}`}>
                                    {t.type === "in" ? "+" : "−"} Rp {t.amount.toLocaleString("id-ID")}
                                  </div>
                                  <span className="text-[10px] text-zinc-455 block mt-0.5">{t.date}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Sub-tab 2: Iuran Tracking */}
                  {walletTab === "iuran" && (
                    <div className="space-y-6">
                      {/* Tampilan Sisi Pengurus (Admin) / Daftar Semua Warga */}
                      <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-base font-bold text-zinc-900">Daftar Tagihan Iuran Warga</h3>
                            <p className="text-xs text-zinc-400">Kas wajib bulanan sebesar **Rp 50.000 / KK**</p>
                          </div>
                          {myRole === "Admin" && shouldShowCreateDuesButton() && (
                            <Button
                              onClick={handleCreateMonthlyDues}
                              className="rounded-xl text-xs font-bold text-white hover:opacity-90"
                              style={{ backgroundColor: activeCommunity.primaryColor }}
                            >
                              Buat Iuran Bulanan
                            </Button>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase">
                                <th className="py-3 px-2">Nama KK / Anggota</th>
                                <th className="py-3 px-2">No. HP / WA</th>
                                <th className="py-3 px-2">Peran</th>
                                <th className="py-3 px-2">Status Bayar</th>
                                {myRole === "Admin" && <th className="py-3 px-2 text-right">Kelola Pembayaran</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-150">
                              {communityDuesBills.length === 0 ? (
                                <tr>
                                  <td colSpan={myRole === "Admin" ? 5 : 4} className="py-8 text-center text-zinc-400 text-xs">
                                    Tidak ada tagihan iuran aktif (semua warga lunas).
                                  </td>
                                </tr>
                              ) : (
                                communityDuesBills.map((bill) => {
                                  const memberInfo = (members[activeCommunity.id] || []).find(m => m.id === bill.profile_id);
                                  const role = memberInfo?.role || "Member";
                                  return (
                                    <tr key={bill.id} className="hover:bg-zinc-50/50">
                                      <td className="py-3 px-2 font-semibold text-zinc-900">
                                        <div>
                                          <p>{bill.profiles?.full_name || "Warga Kyklos"}</p>
                                          <p className="text-[10px] text-zinc-400 font-normal">{bill.title}</p>
                                        </div>
                                      </td>
                                      <td className="py-3 px-2 text-zinc-505">{bill.profiles?.phone || "-"}</td>
                                      <td className="py-3 px-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${role === "Admin" ? "bg-red-50 text-red-655" : "bg-zinc-100 text-zinc-650"
                                          }`}>
                                          {role}
                                        </span>
                                      </td>
                                      <td className="py-3 px-2">
                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                                          Menunggak (Rp {Number(bill.amount).toLocaleString("id-ID")})
                                        </span>
                                      </td>
                                      {myRole === "Admin" && (
                                        <td className="py-3 px-2 text-right space-x-3">
                                          <button
                                            onClick={() => handleToggleIuranStatus(bill.id)}
                                            className="text-xs font-semibold hover:underline"
                                            style={{ color: activeCommunity.primaryColor }}
                                          >
                                            Ubah Status
                                          </button>
                                          <button
                                            onClick={() => handleSendBillReminder(bill.profiles?.full_name || "Warga", bill.profiles?.phone || "")}
                                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 hover:underline"
                                          >
                                            Kirim Pengingat
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Sub-tab 3: Iuran Saya */}
                  {walletTab === "my_iuran" && (
                    <div className="space-y-6">
                      <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                          <div>
                            <h3 className="text-base font-bold text-zinc-900">Tagihan Iuran Saya</h3>
                            <p className="text-xs text-zinc-400 mt-0.5 font-sans">Daftar semua tagihan iuran Anda yang belum dibayar</p>
                          </div>
                        </div>

                        {myUnpaidDues.length === 0 ? (
                          <div className="text-center py-12 space-y-3">
                            <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold border border-emerald-100">
                              🎉
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-800">Semua Iuran Lunas!</p>
                              <p className="text-xs text-zinc-400 font-sans">Tidak ada tagihan iuran tertunggak untuk akun Anda saat ini.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-6 divide-y divide-zinc-100">
                            {myUnpaidDues.map((bill) => (
                              <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                                    <Clock className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-zinc-900">{bill.title}</h4>
                                    <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                                      Jatuh Tempo: <span className="font-semibold text-zinc-600">
                                        {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                  <div className="text-left sm:text-right">
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-full px-2.5 py-0.5 block w-max sm:ml-auto">
                                      Belum Bayar
                                    </span>
                                    <span className="text-base font-black text-zinc-900 block mt-1">
                                      Rp {bill.amount.toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      setSelectedBillToPay(bill);
                                      setIsPaymentOpen(true);
                                    }}
                                    className="rounded-xl text-white font-bold text-xs px-4 h-9 shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                                    style={{ backgroundColor: activeCommunity.primaryColor }}
                                  >
                                    Bayar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {/* --- VIEW: ARISAN MANAGER --- */}
              {activeTab === "arisan" && (
                <div className="space-y-8 animate-fade-in">
                  {/* Title & Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 pb-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Pengelola Arisan</h1>
                      <p className="mt-1.5 text-sm text-zinc-500 font-sans">Kocok otomatis arisan komunitas secara transparan & pantau daftar putaran rotasi.</p>
                    </div>
                  </div>

                  {arisanWinner && !isDrawingArisan && (
                    <div className="border border-emerald-250 bg-emerald-50/60 p-6 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl shadow-sm">
                          🎉
                        </div>
                        <div>
                          <div className="text-base font-extrabold text-emerald-800">
                            Selamat Kepada {arisanWinner}!
                          </div>
                          <div className="text-xs text-emerald-600 font-sans">Terpilih sebagai pemenang arisan dan dana pot cair hari ini.</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200 font-sans shrink-0">
                          Cair Lunas
                        </span>
                        <button
                          onClick={() => setArisanWinner(null)}
                          className="text-emerald-700 hover:text-emerald-950 font-extrabold text-xs ml-2 cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}

                  {(() => {
                    const activeRound = arisanRounds.find(r => r.status === 'pending');
                    if (!activeRound) {
                      // Check if there is any completed round
                      const completedRounds = arisanRounds.filter(r => r.status === 'distributed');
                      const latestRound = completedRounds.length > 0
                        ? completedRounds[completedRounds.length - 1]
                        : null;

                      if (latestRound) {
                        return (
                          <div className="max-w-2xl mx-auto space-y-8 mt-6 animate-fade-in">
                            {/* Card Pemenang Putaran Terakhir */}
                            <Card className="rounded-3xl border border-zinc-200/80 p-8 shadow-sm bg-white text-center space-y-6">
                              <div className="w-24 h-24 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xs animate-bounce">
                                🏆
                              </div>
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                  Putaran Ke-{latestRound.round_number} Selesai
                                </span>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight mt-3">
                                  Arisan Telah Sukses Dikocok!
                                </h2>
                                <p className="text-sm text-zinc-500 max-w-md mx-auto font-sans leading-relaxed">
                                  Pemenang putaran ini adalah <span className="font-extrabold text-zinc-800">{latestRound.winner_profile?.full_name || "Warga Komunitas"}</span> dengan total hadiah pot sebesar <span className="font-bold text-emerald-600">Rp {Number(latestRound.total_prize).toLocaleString("id-ID")}</span> yang telah dicairkan.
                                </p>
                              </div>

                              <div className="pt-2">
                                {myRole === "Admin" ? (
                                  <Button
                                    onClick={() => {
                                      setArisanInputAmount("50000"); // default
                                      setIsMulaiArisanOpen(true);
                                    }}
                                    className="rounded-xl text-white font-bold text-sm px-8 h-12 shadow-sm hover:opacity-90 hover:scale-[1.01] transition-all"
                                    style={{ backgroundColor: activeCommunity?.primaryColor || "#6366f1" }}
                                  >
                                    Mulai Putaran Ke-{latestRound.round_number + 1}
                                  </Button>
                                ) : (
                                  <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-xs text-zinc-500 max-w-xs mx-auto font-sans">
                                    🔒 Menunggu Admin/Bendahara untuk memulai putaran arisan berikutnya.
                                  </div>
                                )}
                              </div>
                            </Card>

                            {/* Riwayat Putaran Lainnya */}
                            {completedRounds.length > 1 && (
                              <Card className="rounded-3xl border border-zinc-200/80 p-6 shadow-sm bg-white space-y-4">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pemenang Putaran Sebelumnya</h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {completedRounds.slice(0, -1).reverse().map((r, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs text-zinc-700 bg-zinc-50 border border-zinc-150 rounded-xl p-3 font-semibold">
                                      <div>
                                        <p className="font-extrabold text-zinc-900">{r.winner_profile?.full_name || "Warga"}</p>
                                        <p className="text-[10px] text-zinc-400 font-normal">Putaran Ke-{r.round_number}</p>
                                      </div>
                                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        Rp {Number(r.total_prize).toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            )}
                          </div>
                        );
                      }

                      // Default Case 1 when no rounds have been played at all
                      return (
                        <div className="max-w-xl mx-auto text-center py-16 px-4 space-y-6 animate-fade-in bg-white border border-zinc-200/80 rounded-2xl shadow-xs mt-6">
                          <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-3xl shadow-xs animate-bounce">
                            🎡
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Belum Ada Arisan Aktif</h2>
                            <p className="text-sm text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
                              Mulai putaran arisan baru untuk komunitas <span className="font-semibold text-zinc-800">{activeCommunity?.name}</span>. Seluruh anggota akan menerima tagihan iuran arisan.
                            </p>
                          </div>

                          {myRole === "Admin" ? (
                            <Button
                              onClick={() => {
                                setArisanInputAmount("50000"); // default
                                setIsMulaiArisanOpen(true);
                              }}
                              className="rounded-xl text-white font-bold text-sm px-8 h-12 shadow-sm hover:opacity-90 hover:scale-[1.01] transition-all"
                              style={{ backgroundColor: activeCommunity?.primaryColor || "#6366f1" }}
                            >
                              Mulai Arisan Baru
                            </Button>
                          ) : (
                            <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-xs text-zinc-500 max-w-xs mx-auto font-sans">
                              🔒 Menunggu Admin/Bendahara untuk memulai putaran arisan baru.
                            </div>
                          )}
                        </div>
                      );
                    }

                    // CASE 2: Arisan Sedang Berjalan (Active)
                    const wonProfileIds = arisanRounds.filter(r => r.winner_profile_id !== null).map(r => r.winner_profile_id);
                    const historicalRounds = arisanRounds.filter(r => r.status === 'distributed');
                    const antreanMembers = activeCommunityMembers.filter(m => !wonProfileIds.includes(m.id));

                    return (
                      <div className="space-y-8 animate-fade-in">
                        {/* Top Stats Banner */}
                        <div className="grid gap-4 sm:grid-cols-3">
                          <Card className="p-5 border border-zinc-200 bg-white rounded-2xl flex flex-col justify-between shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Pot Arisan</span>
                            <div className="text-2xl font-black text-indigo-650 mt-1">
                              Rp {activeRound.total_prize.toLocaleString("id-ID")}
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-2 font-sans">Pot hadiah putaran ini</span>
                          </Card>

                          <Card className="p-5 border border-zinc-200 bg-white rounded-2xl flex flex-col justify-between shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Status Putaran</span>
                            <div className="text-2xl font-black mt-1" style={{ color: activeCommunity?.primaryColor || "#6366f1" }}>
                              Putaran Ke-{activeRound.round_number}
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-2 font-sans">Siklus aktif berjalan</span>
                          </Card>

                          <Card className="p-5 border border-zinc-200 bg-white rounded-2xl flex flex-col justify-between shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Jadwal Kocok Berikutnya</span>
                            <div className="text-sm font-bold text-zinc-800 mt-1.5 flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-zinc-450" />
                              <span>Minggu, 5 Jul · 10:00 WIB</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 mt-2 font-sans">Jadwal rutin bulanan</span>
                          </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                          {/* Left & Middle Columns */}
                          <div className="lg:col-span-2 space-y-6">

                            {/* Kocok Arisan Card */}
                            <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white space-y-6">
                              <h3 className="text-base font-bold text-zinc-900">Tombol "Kocok Arisan"</h3>

                              {myRole === "Admin" ? (() => {
                                const currentRoundBills = arisanBills[selectedCommunityId || ""] || [];
                                const hasUnpaidArisanBills = currentRoundBills.length === 0 || currentRoundBills.some(bill => bill.status !== "paid");
                                const isKocokDisabled = isDrawingArisan || hasUnpaidArisanBills;
                                return (
                                  <div className="border border-zinc-250 bg-zinc-50/50 p-8 rounded-2xl text-center space-y-4">
                                    <Trophy className="h-12 w-12 text-amber-500 mx-auto animate-bounce" />
                                    <div>
                                      <h4 className="font-bold text-zinc-900">Undian Pemenang Acak</h4>
                                      <p className="text-xs text-zinc-505 mt-1 max-w-sm mx-auto font-sans">Klik tombol kocok di bawah untuk mengundi nama anggota yang belum menang putaran arisan kali ini.</p>
                                    </div>
                                    <Button
                                      onClick={runArisanKocok}
                                      disabled={isKocokDisabled}
                                      className="rounded-xl text-white font-bold text-sm px-6 h-11 hover:opacity-90 transition-opacity"
                                      style={{
                                        backgroundColor: isKocokDisabled
                                          ? "#d1d5db"
                                          : (activeCommunity?.primaryColor || "#6366f1")
                                      }}
                                    >
                                      {isDrawingArisan ? (
                                        <>
                                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                          Mengundi Nama...
                                        </>
                                      ) : (
                                        "Mulai Kocok Arisan!"
                                      )}
                                    </Button>
                                    {hasUnpaidArisanBills && (
                                      <p className="text-[11px] text-red-600 font-bold font-sans">
                                        ⚠️ Kocokan dikunci: Masih ada peserta yang belum membayar iuran arisan.
                                      </p>
                                    )}
                                  </div>
                                );
                              })() : (
                                <div className="border border-zinc-200 bg-zinc-50 p-6 rounded-2xl text-center space-y-2">
                                  <Clock className="h-10 w-10 text-violet-500 mx-auto" />
                                  <h4 className="font-bold text-zinc-900">Kocokan Menunggu Admin</h4>
                                  <p className="text-xs text-zinc-505 font-sans">Anda masuk sebagai Member. Menunggu Admin/Bendahara untuk mengocok arisan bulan ini.</p>
                                </div>
                              )}

                              {isDrawingArisan && (
                                <div className="border border-violet-200 bg-violet-55/20 p-8 rounded-2xl text-center space-y-3">
                                  <div className="h-12 w-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                  <p className="text-sm font-bold text-violet-700 font-sans">Mengambil nama secara acak dari wadah arisan...</p>
                                </div>
                              )}

                            </Card>

                            {/* Status Putaran / Rotasi Lists */}
                            <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white space-y-6">
                              <div>
                                <h3 className="text-base font-bold text-zinc-900">Status Putaran & Rotasi Pemenang</h3>
                                <p className="text-xs text-zinc-400 mt-0.5 font-sans">Daftar pemenang bulanan sebelumnya dan anggota yang masih mengantre.</p>
                              </div>

                              <div className="grid gap-6 md:grid-cols-2">
                                {/* Sudah Menang */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Sudah Menang (Rotasi Selesai)
                                  </h4>
                                  <ul className="space-y-2">
                                    {historicalRounds.length === 0 ? (
                                      <li className="text-xs text-zinc-400 italic p-3 bg-zinc-50 border border-zinc-100 rounded-xl font-sans">Belum ada pemenang terdahulu.</li>
                                    ) : (
                                      historicalRounds.map((r, idx) => (
                                        <li key={idx} className="flex items-center justify-between text-xs text-zinc-700 bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 font-semibold">
                                          <span>{r.winner_profile?.full_name || "Anggota"}</span>
                                          <span className="text-[10px] text-emerald-650 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                                            Putaran {r.round_number}
                                          </span>
                                        </li>
                                      ))
                                    )}
                                  </ul>
                                </div>

                                {/* Belum Menang */}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    Belum Menang (Mengantre)
                                  </h4>
                                  <ul className="space-y-2">
                                    {antreanMembers.length === 0 ? (
                                      <li className="text-xs text-zinc-400 italic p-3 bg-zinc-50 border border-zinc-100 rounded-xl font-sans">Semua warga telah menang putaran ini!</li>
                                    ) : (
                                      antreanMembers.map((m) => (
                                        <li key={m.id} className="flex items-center justify-between text-xs text-zinc-655 bg-zinc-50 border border-zinc-100 rounded-xl p-3 font-medium">
                                          <span>{m.name}</span>
                                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                                            Antrean
                                          </span>
                                        </li>
                                      ))
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </Card>
                          </div>

                          {/* Right Column: Daftar Peserta */}
                          <div className="space-y-6">
                            <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white space-y-4">
                              <div>
                                <h3 className="text-base font-bold text-zinc-900">Daftar Peserta Arisan</h3>
                                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                                  Tagihan iuran untuk Putaran Ke-{activeRound.round_number}.
                                </p>
                              </div>

                              <div className="divide-y divide-zinc-100">
                                {(!arisanBills[selectedCommunityId || ""] || arisanBills[selectedCommunityId || ""].length === 0) ? (
                                  <div className="py-4 text-center text-xs text-zinc-400 italic">
                                    Belum ada tagihan arisan untuk putaran ini.
                                  </div>
                                ) : (
                                  arisanBills[selectedCommunityId || ""].map((bill) => (
                                    <div key={bill.id} className="py-3 flex items-center justify-between gap-2 animate-fade-in">
                                      <div className="min-w-0">
                                        <span className="text-sm font-semibold text-zinc-900 block truncate">
                                          {bill.profile?.full_name || "Anggota"}
                                        </span>
                                        <span className="text-[10px] text-zinc-455 block truncate">
                                          {bill.profile?.phone || "-"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-extrabold uppercase rounded px-1.5 py-0.5 border ${bill.status === "paid"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                          : "bg-red-50 text-red-700 border-red-105"
                                          }`}>
                                          {bill.status === "paid" ? "Lunas" : "Belum Bayar"}
                                        </span>
                                        {bill.profile?.id === currentUser?.id && bill.status === "unpaid" && (
                                          <button
                                            onClick={() => {
                                              setSelectedBillToPay({
                                                id: bill.id,
                                                title: bill.title,
                                                amount: bill.amount,
                                                status: bill.status,
                                                pocket_id: bill.pocket_id || null
                                              });
                                              setIsPaymentOpen(true);
                                            }}
                                            className="text-[10px] font-bold text-emerald-600 hover:underline shrink-0"
                                          >
                                            Bayar
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </Card>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}


              {/* --- VIEW: DISCUSSION FORUM --- */}
              {activeTab === "discussion" && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Forum Diskusi Warga</h1>
                    <p className="mt-1.5 text-sm text-zinc-500">Wadah diskusi, usulan, dan polling komunitas agar tidak tenggelam.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-6">
                      <Card className="rounded-2xl border border-zinc-200/80 p-5 shadow-sm bg-white space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900">Buat Utas Baru</h3>
                        <form onSubmit={handleCreateThread} className="space-y-3">
                          <Input
                            required
                            value={newThreadTitle}
                            onChange={(e) => setNewThreadTitle(e.target.value)}
                            placeholder="Tulis topik diskusi..."
                            className="text-xs"
                          />
                          <Button
                            type="submit"
                            className="w-full text-xs font-bold text-white rounded-xl h-9 hover:opacity-90"
                            style={{ backgroundColor: activeCommunity.primaryColor }}
                          >
                            Posting Topik
                          </Button>
                        </form>
                      </Card>

                      <Card className="rounded-2xl border border-zinc-200/80 p-5 shadow-sm bg-white space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900">Daftar Utas</h3>
                        <ul className="space-y-2">
                          {getDiscussions().map((disc) => (
                            <li
                              key={disc.id}
                              onClick={() => setActiveDiscussionId(disc.id)}
                              className="p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all"
                              style={{
                                backgroundColor: activeDiscussionId === disc.id ? `${activeCommunity.primaryColor}10` : "#fafafa",
                                borderColor: activeDiscussionId === disc.id ? activeCommunity.primaryColor : "#e4e4e7",
                              }}
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                {disc.hot && <Flame className="h-3.5 w-3.5 text-orange-500 shrink-0" />}
                                <span className="font-bold truncate block">{disc.title}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400 flex justify-between">
                                <span>Oleh {disc.author}</span>
                                <span>{disc.comments.length} Balasan</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    <div className="md:col-span-2">
                      {activeDiscussionId ? (
                        (() => {
                          const activeDisc = getDiscussions().find((d) => d.id === activeDiscussionId);
                          if (!activeDisc) return null;

                          return (
                            <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white space-y-6 animate-fade-in">
                              <div className="pb-4 border-b border-zinc-150 space-y-2">
                                <h3 className="text-lg font-bold text-zinc-905">{activeDisc.title}</h3>
                                <p className="text-xs text-zinc-405">
                                  Topik dimulai oleh <span className="font-semibold text-zinc-600">{activeDisc.author}</span>
                                </p>
                              </div>

                              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {activeDisc.comments.length === 0 ? (
                                  <p className="text-center py-6 text-zinc-400 text-xs font-medium">Belum ada tanggapan. Jadilah yang pertama memberikan respon!</p>
                                ) : (
                                  activeDisc.comments.map((comment, index) => (
                                    <div key={index} className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 space-y-1">
                                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                                        <span>{comment.author}</span>
                                        <span>{comment.date}</span>
                                      </div>
                                      <p className="text-xs text-zinc-700 leading-relaxed">{comment.content}</p>
                                    </div>
                                  ))
                                )}
                              </div>

                              <form onSubmit={handleAddComment} className="flex gap-2">
                                <Input
                                  required
                                  value={newCommentContent}
                                  onChange={(e) => setNewCommentContent(e.target.value)}
                                  placeholder="Ketik tanggapan Anda..."
                                  className="text-xs h-10"
                                />
                                <Button
                                  type="submit"
                                  className="text-xs font-bold text-white rounded-xl px-4 h-10 hover:opacity-90"
                                  style={{ backgroundColor: activeCommunity.primaryColor }}
                                >
                                  Kirim
                                </Button>
                              </form>
                            </Card>
                          );
                        })()
                      ) : (
                        <Card className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-12 text-center text-zinc-400 text-sm font-semibold h-full flex flex-col items-center justify-center">
                          <MessageSquare className="h-8 w-8 mb-2 text-zinc-350" />
                          Pilih salah satu utas diskusi di sebelah kiri untuk membaca dan mengirim komentar.
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- VIEW: EVENTS & ACTIVITIES --- */}
              {activeTab === "events" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Agenda & Kegiatan</h1>
                      <p className="mt-1.5 text-sm text-zinc-500">Atur kalender acara bersama dan tracking RSVP kehadiran warga secara real-time.</p>
                    </div>
                    {myRole === "Admin" && getEvents().length > 0 && (
                      <Button
                        onClick={() => {
                          // Auto-select the Event Fund pocket
                          const communityPockets = pockets[selectedCommunityId || ""] || [];
                          const eventPocket = communityPockets.find((p) =>
                            p.name.toLowerCase().includes("event") || p.name.toLowerCase().includes("acara")
                          );
                          setNewEventPocketId(eventPocket?.id || "");
                          setIsCreateEventOpen(true);
                        }}
                        className="rounded-xl text-xs font-bold text-white hover:opacity-90"
                        style={{ backgroundColor: activeCommunity.primaryColor }}
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Buat Acara Baru
                      </Button>
                    )}
                  </div>

                  {getEvents().length === 0 ? (
                    <div className="max-w-xl mx-auto text-center py-16 px-4 space-y-6 animate-fade-in bg-white border border-zinc-200/80 rounded-2xl shadow-xs mt-6">
                      <div className="w-20 h-20 bg-indigo-55 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-3xl shadow-xs animate-bounce">
                        📅
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Belum Ada Agenda</h2>
                        <p className="text-sm text-zinc-500 max-w-sm mx-auto font-sans leading-relaxed">
                          Jadwalkan kegiatan warga seperti rapat bulanan, kerja bakti, atau kegiatan bersama di sini untuk mempermudah RSVP kehadiran.
                        </p>
                      </div>

                      {myRole === "Admin" ? (
                        <Button
                          onClick={() => {
                            const communityPockets = pockets[selectedCommunityId || ""] || [];
                            const eventPocket = communityPockets.find((p) =>
                              p.name.toLowerCase().includes("event") || p.name.toLowerCase().includes("acara")
                            );
                            setNewEventPocketId(eventPocket?.id || "");
                            setIsCreateEventOpen(true);
                          }}
                          className="rounded-xl text-white font-bold text-sm px-8 h-12 shadow-sm hover:opacity-90 hover:scale-[1.01] transition-all"
                          style={{ backgroundColor: activeCommunity?.primaryColor || "#6366f1" }}
                        >
                          <Plus className="mr-2 h-4 w-4 inline" />
                          Buat Acara Baru
                        </Button>
                      ) : (
                        <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-xs text-zinc-500 max-w-xs mx-auto font-sans">
                          🔒 Menunggu Admin/Bendahara untuk menjadwalkan agenda baru.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/70">
                              <th className="text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wide px-5 py-3">Acara</th>
                              <th className="text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Waktu</th>
                              <th className="text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wide px-4 py-3 hidden md:table-cell">Lokasi</th>
                              <th className="text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide px-4 py-3">Hadir</th>
                              <th className="text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide px-4 py-3">Tdk Hadir</th>
                              <th className="text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide px-4 py-3">Status Kamu</th>
                              <th className="text-center text-[11px] font-bold text-zinc-500 uppercase tracking-wide px-4 py-3">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {getEvents().map((ev) => (
                              <tr key={ev.id} className="hover:bg-zinc-50/50 transition-colors">
                                {/* Acara */}
                                <td className="px-5 py-4">
                                  <div className="space-y-1">
                                    <div className="font-bold text-zinc-900 text-sm">{ev.title}</div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 border"
                                        style={{
                                          backgroundColor: ev.status === "done" ? "#ecfdf5" : `${activeCommunity.primaryColor}10`,
                                          color: ev.status === "done" ? "#047857" : activeCommunity.primaryColor,
                                          borderColor: ev.status === "done" ? "#a7f3d0" : `${activeCommunity.primaryColor}30`,
                                        }}
                                      >
                                        {ev.status === "done" ? "Selesai" : "Mendatang"}
                                      </span>
                                      {ev.price && ev.price > 0 ? (
                                        <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 border border-amber-200 bg-amber-50 text-amber-700">
                                          💰 Rp {ev.price.toLocaleString("id-ID")}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold uppercase rounded-full px-2 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700">
                                          ✓ Gratis
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Waktu */}
                                <td className="px-4 py-4 hidden sm:table-cell">
                                  <span className="text-xs text-zinc-500 font-sans">{ev.when}</span>
                                </td>

                                {/* Lokasi */}
                                <td className="px-4 py-4 hidden md:table-cell">
                                  <span className="text-xs text-zinc-500 font-sans">{ev.location || "Balai Warga"}</span>
                                </td>

                                {/* Hadir count */}
                                <td className="px-4 py-4 text-center">
                                  <span className="font-extrabold text-emerald-600 text-sm">{ev.rsvpYesCount}</span>
                                </td>

                                {/* Tidak Hadir count */}
                                <td className="px-4 py-4 text-center">
                                  <span className="font-extrabold text-red-500 text-sm">{ev.rsvpNoCount}</span>
                                </td>

                                {/* Status Kamu */}
                                <td className="px-4 py-4 text-center">
                                  {ev.status === "done" ? (
                                    <span className="text-[10px] text-zinc-400 font-semibold">Selesai</span>
                                  ) : ev.userRSVP !== "none" ? (
                                    <span
                                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                                      style={{
                                        backgroundColor: ev.userRSVP === "yes" ? `${activeCommunity.primaryColor}15` : "#fee2e2",
                                        color: ev.userRSVP === "yes" ? activeCommunity.primaryColor : "#ef4444",
                                        borderColor: ev.userRSVP === "yes" ? `${activeCommunity.primaryColor}40` : "#fca5a5",
                                      }}
                                    >
                                      {ev.userRSVP === "yes" ? "✓ Hadir" : "✗ Tidak Hadir"}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-zinc-400 font-semibold">Belum Pilih</span>
                                  )}
                                </td>

                                {/* Aksi */}
                                <td className="px-4 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {ev.status === "done" ? (
                                      <span className="text-[10px] text-zinc-300 font-semibold">—</span>
                                    ) : ev.userRSVP !== "none" ? (
                                      ev.userRSVP === "yes" && ev.price && ev.price > 0 ? (
                                        <button
                                          onClick={async () => {
                                            let ticketBill = myUnpaidDues.find(b => b.title === `Tiket: ${ev.title}` || b.title.includes(ev.title));

                                            if (!ticketBill) {
                                              const { data } = await supabase
                                                .from("dues_bills")
                                                .select("*")
                                                .eq("community_id", selectedCommunityId)
                                                .eq("profile_id", currentUser.id)
                                                .eq("status", "unpaid")
                                                .ilike("title", `%${ev.title}%`)
                                                .maybeSingle();

                                              if (data) {
                                                ticketBill = {
                                                  id: data.id,
                                                  title: data.title,
                                                  amount: Number(data.amount),
                                                  status: data.status,
                                                  due_date: data.due_date,
                                                  pocket_id: data.pocket_id
                                                };
                                              }
                                            }

                                            if (ticketBill) {
                                              setSelectedBillToPay(ticketBill);
                                              setIsPaymentOpen(true);
                                            } else {
                                              const eventDueDate = ev.event_date
                                                ? new Date(ev.event_date).toISOString().split("T")[0]
                                                : new Date().toISOString().split("T")[0];

                                              const { data: newBill } = await supabase
                                                .from("dues_bills")
                                                .insert({
                                                  community_id: selectedCommunityId,
                                                  profile_id: currentUser.id,
                                                  title: `Tiket: ${ev.title}`,
                                                  amount: ev.price,
                                                  due_date: eventDueDate,
                                                  status: "unpaid",
                                                  pocket_id: ev.pocket_id || null,
                                                })
                                                .select()
                                                .single();

                                              if (newBill) {
                                                const mappedBill = {
                                                  id: newBill.id,
                                                  title: newBill.title,
                                                  amount: Number(newBill.amount),
                                                  status: newBill.status,
                                                  due_date: newBill.due_date,
                                                  pocket_id: newBill.pocket_id
                                                };
                                                await fetchMyUnpaidDues(selectedCommunityId, currentUser.id);
                                                setSelectedBillToPay(mappedBill);
                                                setIsPaymentOpen(true);
                                              } else {
                                                Swal.fire({
                                                  title: "Error",
                                                  text: "Gagal memproses pembayaran tiket. Silakan coba kembali.",
                                                  icon: "error",
                                                  confirmButtonColor: activeCommunity?.primaryColor || "#6366f1",
                                                });
                                              }
                                            }
                                          }}
                                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                                          style={{ backgroundColor: activeCommunity.primaryColor }}
                                        >
                                          💳 Bayar
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-zinc-300 font-semibold">🔒 Terkunci</span>
                                      )
                                    ) : (
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() => handleRSVP(ev.id, "yes")}
                                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-zinc-200 bg-white text-zinc-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                                        >
                                          ✓ Hadir
                                        </button>
                                        <button
                                          onClick={() => handleRSVP(ev.id, "no")}
                                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-zinc-200 bg-white text-zinc-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
                                        >
                                          ✗ Tidak
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- VIEW: MEMBERS MANAGEMENT --- */}
              {activeTab === "members" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Anggota Komunitas</h1>
                      <p className="mt-1.5 text-sm text-zinc-500">Daftar kontak warga dan pengaturan hak akses peran di dalam komunitas.</p>
                    </div>
                    {myRole === "Admin" && (
                      <Button
                        onClick={handleCopyInviteCode}
                        className="rounded-xl text-xs font-bold text-white hover:opacity-90"
                        style={{ backgroundColor: activeCommunity.primaryColor }}
                      >
                        Salin Kode Undangan
                      </Button>
                    )}
                  </div>

                  <Card className="rounded-2xl border border-zinc-200/80 p-6 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase">
                            <th className="py-3 px-2">Nama Lengkap</th>
                            <th className="py-3 px-2">No. Telepon / HP</th>
                            <th className="py-3 px-2">Peran Aktif</th>
                            {myRole === "Admin" && <th className="py-3 px-2 text-right">Aksi Kelola</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150">
                          {activeCommunityMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-zinc-50/50">
                              <td className="py-3.5 px-2 font-semibold text-zinc-900">{member.name}</td>
                              <td className="py-3.5 px-2 text-zinc-505">{member.phone}</td>
                              <td className="py-3.5 px-2">
                                <span className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase ${member.role === "Admin" ? "bg-red-50 text-red-655" : "bg-emerald-50 text-emerald-700"
                                  }`}>
                                  {member.role}
                                </span>
                              </td>
                              {myRole === "Admin" && (
                                <td className="py-3.5 px-2 text-right">
                                  {member.name !== profileName ? (
                                    <button
                                      onClick={() => handleToggleMemberRole(member.id)}
                                      className="text-xs font-semibold hover:underline"
                                      style={{ color: activeCommunity.primaryColor }}
                                    >
                                      Ubah Jadi {member.role === "Admin" ? "Member" : "Admin"}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-zinc-405 italic">Self (Pemilik)</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

            </main>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* ======================= MODALS ========================= */}
      {/* ======================================================== */}

      {/* Modal: Mulai Arisan */}
      {isMulaiArisanOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs p-4 flex justify-center items-center">
          <Card className="w-full max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-xl relative animate-fade-in">
            <button onClick={() => setIsMulaiArisanOpen(false)} className="absolute right-4 top-4 text-zinc-450 hover:text-zinc-650">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-955 mb-1">Mulai Arisan Baru</h2>
            <p className="text-xs text-zinc-500 mb-6">Tentukan nominal iuran arisan per anggota untuk putaran aktif ini.</p>

            <form onSubmit={handleConfirmMulaiArisan} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="arisan-amount">Nominal Arisan per Anggota (Rp)</Label>
                <Input
                  id="arisan-amount"
                  type="number"
                  required
                  value={arisanInputAmount}
                  onChange={(e) => setArisanInputAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="rounded-xl h-11"
                />
              </div>

              {/* Informational preview */}
              <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl text-xs space-y-1 text-zinc-555">
                <div className="flex justify-between">
                  <span>Jumlah Peserta:</span>
                  <span className="font-semibold text-zinc-900">{(members[selectedCommunityId || ""] || []).length} Orang</span>
                </div>
                <div className="flex justify-between border-t border-zinc-250 pt-1.5 mt-1.5 font-bold text-zinc-800">
                  <span>Proyeksi Total Pot Hadiah:</span>
                  <span className="text-indigo-650">
                    Rp {((parseFloat(arisanInputAmount) || 0) * (members[selectedCommunityId || ""] || []).length).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMulaiArisanOpen(false)}
                  disabled={isLoadingArisan}
                  className="rounded-xl text-xs font-semibold h-10 px-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoadingArisan}
                  className="rounded-xl text-white font-bold text-xs h-10 px-5"
                  style={{ backgroundColor: activeCommunity?.primaryColor || "#6366f1" }}
                >
                  {isLoadingArisan ? "Memproses..." : "Konfirmasi Mulai Arisan"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 1. Modal: Buat Komunitas */}
      {isCreateCommOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs p-4 flex justify-center items-start">
          <Card className="w-full max-w-2xl bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl relative animate-fade-in my-8">
            <button onClick={() => setIsCreateCommOpen(false)} className="absolute right-4 top-4 text-zinc-450 hover:text-zinc-650">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-955 mb-1">Buat Komunitas Baru</h2>
            <p className="text-xs text-zinc-555 mb-6">Lengkapi identitas dasar, branding warna, dan kantong dana untuk memulai.</p>

            <form onSubmit={handleCreateCommunity} className="space-y-6">
              {/* Bagian 1: Identitas Dasar */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-100">
                  1. Identitas Dasar Komunitas
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="comm-name">Nama Komunitas</Label>
                    <Input
                      id="comm-name"
                      required
                      value={newCommName}
                      onChange={(e) => setNewCommName(e.target.value)}
                      placeholder="RT 05 Kampoeng Hijau, Alumni SMAN 1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="comm-type">Tipe Komunitas</Label>
                    <select
                      id="comm-type"
                      className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-655"
                      value={newCommType}
                      onChange={(e) => setNewCommType(e.target.value)}
                    >
                      <option value="Neighborhood (RT/RW)">Neighborhood (RT/RW)</option>
                      <option value="Family Arisan">Family Arisan</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Hobby/Sports">Hobby/Sports</option>
                      <option value="Religious/Social">Religious/Social</option>
                      <option value="Paguyuban/Business Group">Paguyuban/Business Group</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="comm-desc">Deskripsi Komunitas</Label>
                  <textarea
                    id="comm-desc"
                    required
                    rows={2}
                    className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    placeholder="Tujuan pembentukan kas atau tata tertib pembayaran iuran wajib komunitas..."
                  />
                </div>
              </div>

              {/* Bagian 2: Konfigurasi Whitelabel */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-100">
                  2. Konfigurasi Whitelabel
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Logo Komunitas</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSimulateUpload}
                        className="rounded-xl border-dashed border-zinc-300 text-zinc-600 text-xs w-full flex gap-1.5 items-center justify-center h-11 bg-zinc-50/50 hover:bg-zinc-50"
                      >
                        <Upload className="h-4 w-4" />
                        {newCommLogoName ? "Ganti Logo" : "Unggah Logo"}
                      </Button>
                    </div>
                    {newCommLogoName && (
                      <span className="text-[10px] text-emerald-650 font-semibold truncate block mt-1">
                        Selected: {newCommLogoName}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="comm-color">Warna Utama (Primary Color)</Label>
                    <div className="flex gap-3 items-center">
                      <input
                        id="comm-color"
                        type="color"
                        className="h-11 w-16 border border-zinc-200 rounded-xl cursor-pointer p-0.5 bg-white"
                        value={newCommColor}
                        onChange={(e) => setNewCommColor(e.target.value)}
                      />
                      <Input
                        type="text"
                        className="h-11 font-mono uppercase text-xs"
                        value={newCommColor}
                        onChange={(e) => setNewCommColor(e.target.value)}
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 3: Inisialisasi Kantong Dana Keuangan */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-100">
                  3. Inisialisasi Kantong Dana Keuangan
                </h3>

                <div className="space-y-2">
                  <Label>Kantong Dana Awal (Pockets)</Label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 border border-zinc-150 p-2.5 rounded-xl cursor-pointer hover:bg-zinc-50 bg-white">
                      <input
                        type="checkbox"
                        checked={initTreasury}
                        onChange={(e) => setInitTreasury(e.target.checked)}
                        className="rounded border-zinc-300 text-indigo-655 focus:ring-indigo-650"
                      />
                      <div>
                        <div className="font-semibold text-zinc-800">Treasury</div>
                        <div className="text-[10px] text-zinc-400">Dana kas utama</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 border border-zinc-150 p-2.5 rounded-xl cursor-pointer hover:bg-zinc-50 bg-white">
                      <input
                        type="checkbox"
                        checked={initArisan}
                        onChange={(e) => setInitArisan(e.target.checked)}
                        className="rounded border-zinc-300 text-indigo-655 focus:ring-indigo-650"
                      />
                      <div>
                        <div className="font-semibold text-zinc-800">Arisan</div>
                        <div className="text-[10px] text-zinc-400">Dana putaran arisan</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 border border-zinc-150 p-2.5 rounded-xl cursor-pointer hover:bg-zinc-50 bg-white">
                      <input
                        type="checkbox"
                        checked={initDues}
                        onChange={(e) => setInitDues(e.target.checked)}
                        className="rounded border-zinc-300 text-indigo-655 focus:ring-indigo-650"
                      />
                      <div>
                        <div className="font-semibold text-zinc-800">Recurring Dues</div>
                        <div className="text-[10px] text-zinc-400">Iuran rutin bulanan</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 border border-zinc-150 p-2.5 rounded-xl cursor-pointer hover:bg-zinc-50 bg-white">
                      <input
                        type="checkbox"
                        checked={initEvent}
                        onChange={(e) => setInitEvent(e.target.checked)}
                        className="rounded border-zinc-300 text-indigo-655 focus:ring-indigo-650"
                      />
                      <div>
                        <div className="font-semibold text-zinc-800">Event Fund</div>
                        <div className="text-[10px] text-zinc-400">Dana khusus acara</div>
                      </div>
                    </label>
                  </div>
                </div>

                {initDues && (
                  <div className="space-y-1.5 animate-fade-in">
                    <Label htmlFor="dues-amount">Nominal Iuran Bulanan (Rupiah)</Label>
                    <Input
                      id="dues-amount"
                      type="number"
                      required={initDues}
                      value={newCommDuesAmount}
                      onChange={(e) => setNewCommDuesAmount(e.target.value)}
                      placeholder="Masukkan nominal iuran bulanan default"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm">
                  Buat Komunitas & Masuk Dashboard
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 2. Modal: Gabung Komunitas */}
      {isJoinCommOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-xl relative animate-fade-in">
            <button onClick={() => setIsJoinCommOpen(false)} className="absolute right-4 top-4 text-zinc-450 hover:text-zinc-650">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-955 mb-1">Gabung Komunitas</h2>
            <p className="text-xs text-zinc-500 mb-6">Masukkan kode undangan komunitas untuk ikut memantau kas.</p>

            <form onSubmit={handleJoinCommunity} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="join-code">Kode Undangan (Invite Code)</Label>
                <Input
                  id="join-code"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Contoh: MELATI-98X"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
                  Gabung Sekarang
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 3. Modal: Tambah Kantong (Pocket) */}
      {isAddPocketOpen && activeCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-xl relative animate-fade-in">
            <button onClick={() => setIsAddPocketOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-655">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-950 mb-1">Tambah Kantong Dana</h2>
            <p className="text-xs text-zinc-500 mb-6">Pisahkan pos dana komunitas agar pencatatan tidak campur aduk.</p>

            <form onSubmit={handleAddPocket} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pocket-name">Nama Kantong Dana</Label>
                <Input
                  id="pocket-name"
                  required
                  value={newPocketName}
                  onChange={(e) => setNewPocketName(e.target.value)}
                  placeholder="Contoh: Dana Kematian, Kas Rapat, Kas 17an"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pocket-balance">Saldo Awal (Opsional)</Label>
                <Input
                  id="pocket-balance"
                  type="number"
                  value={newPocketBalance}
                  onChange={(e) => setNewPocketBalance(e.target.value)}
                  placeholder="Mulai dari Rp 0"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pocket-color">Tema Warna Kantong</Label>
                <select
                  id="pocket-color"
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-650"
                  value={newPocketTone}
                  onChange={(e) => setNewPocketTone(e.target.value as any)}
                >
                  <option value="primary">Biru / Ungu Utama</option>
                  <option value="accent">Teal / Hijau Aksen</option>
                  <option value="warning">Oranye / Kuning Aksen</option>
                </select>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 rounded-xl text-white font-bold text-sm hover:opacity-90" style={{ backgroundColor: activeCommunity.primaryColor }}>
                  Simpan Kantong
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 4. Modal: Catat Transaksi */}
      {isAddTxOpen && activeCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-white p-6 rounded-2xl border border-zinc-200 shadow-xl relative animate-fade-in">
            <button onClick={() => setIsAddTxOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-650">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-955 mb-1">Catat Transaksi Komunitas</h2>
            <p className="text-xs text-zinc-550 mb-6">Pencatatan langsung terlihat oleh seluruh warga.</p>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tx-desc">Deskripsi Transaksi</Label>
                <Input
                  id="tx-desc"
                  required
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Pembelian snack rapat, Pembayaran kas warga"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tx-type">Tipe Transaksi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType("in")}
                    className={`h-10 text-xs font-bold rounded-xl border ${txType === "in"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-zinc-200 text-zinc-600"
                      }`}
                  >
                    Uang Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType("out")}
                    className={`h-10 text-xs font-bold rounded-xl border ${txType === "out"
                      ? "bg-red-50 border-red-500 text-red-750"
                      : "bg-white border-zinc-200 text-zinc-600"
                      }`}
                  >
                    Uang Keluar (-)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tx-amount">Nominal (Rupiah)</Label>
                  <Input
                    id="tx-amount"
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Contoh: 150000"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tx-pocket">Sumber Kantong</Label>
                  <select
                    id="tx-pocket"
                    required
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-650"
                    value={txPocketId}
                    onChange={(e) => setTxPocketId(e.target.value)}
                  >
                    <option value="">Pilih Kantong...</option>
                    {(pockets[activeCommunity.id] || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Rp {p.balance.toLocaleString("id-ID")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 rounded-xl text-white font-bold text-sm hover:opacity-90" style={{ backgroundColor: activeCommunity.primaryColor }}>
                  Simpan Transaksi
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 5. Modal: Pembayaran Iuran (Simulasi Midtrans) */}
      {isPaymentOpen && activeCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-sm bg-white p-0 rounded-2xl border border-zinc-200 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-5 w-5 text-indigo-400" />
                <span className="font-bold text-sm tracking-wide">Secure Checkout</span>
              </div>
              <button onClick={() => { setIsPaymentOpen(false); setSelectedBillToPay(null); }} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount & Description */}
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Tagihan</span>
                <h3 className="text-2xl font-black text-zinc-900">
                  Rp {selectedBillToPay ? Number(selectedBillToPay.amount).toLocaleString("id-ID") : "50.000"}
                </h3>
                <p className="text-xs text-zinc-500 font-sans">
                  {selectedBillToPay ? selectedBillToPay.title : `Iuran Kas Wajib ${activeCommunity.name}`}
                </p>
              </div>

              {/* Xendit supported methods info */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Metode pembayaran yang tersedia</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "QRIS", color: "bg-rose-50 text-rose-700 border-rose-100" },
                    { label: "VA Bank", color: "bg-blue-50 text-blue-700 border-blue-100" },
                    { label: "E-Wallet", color: "bg-purple-50 text-purple-700 border-purple-100" },
                    { label: "Retail", color: "bg-orange-50 text-orange-700 border-orange-100" },
                  ].map((m) => (
                    <span key={m.label} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${m.color}`}>
                      {m.label}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                  Anda akan diarahkan ke halaman Xendit untuk memilih metode pembayaran yang Anda inginkan.
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-1">
                <Button
                  onClick={handleRedirectToInvoice}
                  className="w-full h-12 rounded-xl text-white font-bold text-sm shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: activeCommunity.primaryColor }}
                >
                  Bayar Sekarang →
                </Button>
              </div>

              <p className="text-[10px] text-center text-zinc-400 font-sans">
                Didukung oleh <span className="font-bold">Xendit</span> Payment Gateway. Pembayaran aman &amp; terenkripsi.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* 6. Modal: Buat Agenda Baru */}
      {isCreateEventOpen && activeCommunity && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white p-0 rounded-2xl border border-zinc-200 shadow-xl relative animate-fade-in my-8 overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-zinc-100">
              <button onClick={() => setIsCreateEventOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-650">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-zinc-900">Buat Agenda Baru</h2>
              <p className="text-xs text-zinc-500 mt-0.5 font-sans">Tambahkan kegiatan komunitas dan atur tiket untuk anggota.</p>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              {/* Nama Kegiatan */}
              <div className="space-y-1.5">
                <Label htmlFor="event-title">Nama Kegiatan <span className="text-red-500">*</span></Label>
                <Input
                  id="event-title"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Contoh: Rapat Koordinasi RT, Kerja Bakti Bersama"
                  className="rounded-xl h-10"
                />
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label htmlFor="event-desc">Deskripsi Kegiatan</Label>
                <textarea
                  id="event-desc"
                  rows={2}
                  className="flex w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Tujuan atau detail agenda pertemuan..."
                />
              </div>

              {/* Lokasi */}
              <div className="space-y-1.5">
                <Label htmlFor="event-location">Lokasi / Link Online <span className="text-red-500">*</span></Label>
                <Input
                  id="event-location"
                  required
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="Contoh: Balai Warga RT 01 / https://meet.google.com/..."
                  className="rounded-xl h-10"
                />
              </div>

              {/* Tanggal & Waktu */}
              <div className="space-y-1.5">
                <Label htmlFor="event-date">Tanggal & Waktu Pelaksanaan <span className="text-red-500">*</span></Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              {/* Biaya Tiket */}
              <div className="space-y-1.5">
                <Label htmlFor="event-price">Biaya Tiket (Rp)</Label>
                <Input
                  id="event-price"
                  type="number"
                  min="0"
                  value={newEventPrice}
                  onChange={(e) => setNewEventPrice(e.target.value)}
                  placeholder="0 = Gratis"
                  className="rounded-xl h-10"
                />
                <p className="text-[10px] text-zinc-400 font-sans">Isi 0 jika acara gratis · Pemasukan tiket otomatis masuk ke Event Fund</p>
              </div>

              {/* Preview Info */}
              {parseFloat(newEventPrice) > 0 && (
                <div className="bg-amber-50 border border-amber-150 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2 font-sans">
                  <span className="text-base">💰</span>
                  <div>
                    <span className="font-bold">Acara Berbayar:</span> Tagihan tiket Rp {parseFloat(newEventPrice).toLocaleString("id-ID")} akan otomatis dikirim ke seluruh <span className="font-semibold">{(members[selectedCommunityId || ""] || []).length} anggota</span> komunitas ini setelah acara dibuat.
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateEventOpen(false)}
                  disabled={isCreatingEvent}
                  className="flex-1 rounded-xl h-11 text-sm font-semibold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingEvent}
                  className="flex-1 h-11 rounded-xl text-white font-bold text-sm hover:opacity-90"
                  style={{ backgroundColor: activeCommunity.primaryColor }}
                >
                  {isCreatingEvent ? "Menyimpan..." : "Buat Agenda"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
