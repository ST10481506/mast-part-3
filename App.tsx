// --- FINAL POE: PART 2 (UI & features) + PART 3 (logic & calculations) ---

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";

// For strict TS in web builds
declare const window: any;
declare const alert: any;

type Course = "Starters" | "Mains" | "Desserts";
type Dish = {
  id: number;
  name: string;
  description: string;
  course: Course;
  price: number;
};
type TabKey = "Home" | "Filter" | "Manage";

const COURSES: Course[] = ["Starters", "Mains", "Desserts"];

export default function App() {
  const colors = {
    bg: "#FAFBFC",
    text: "#222222",
    card: "#FFFFFF",
    accent: "#FF7E67",
    secondary: "#4CB9B8",
    border: "#E0E6EA",
    muted: "#888",
    danger: "#FF5C5C",
  };

  // Preloaded sample dishes
  const [dishes, setDishes] = useState<Dish[]>([
    {
      id: 1,
      name: "Bruschetta",
      description: "Toasted bread with tomatoes & basil",
      course: "Starters",
      price: 75,
    },
    {
      id: 2,
      name: "Roast Chicken",
      description: "Herb-seasoned chicken with veggies",
      course: "Mains",
      price: 180,
    },
    {
      id: 3,
      name: "Tiramisu",
      description: "Classic Italian dessert",
      course: "Desserts",
      price: 95,
    },
  ]);

  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [priceText, setPriceText] = useState("");
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState<TabKey>("Home");

  // --- PART 3: Logic (functions, loops, validation) ---
  // For-loop average calculator per course (meets loop + function requirement)
  const calcAverages = (arr: Dish[]) => {
    const result: Record<Course, number> = {
      Starters: 0,
      Mains: 0,
      Desserts: 0,
    };
    for (const c of COURSES) {
      const subset = arr.filter((d) => d.course === c);
      if (subset.length) {
        let total = 0;
        for (let i = 0; i < subset.length; i++) total += subset[i].price;
        result[c] = parseFloat((total / subset.length).toFixed(2));
      }
    }
    return result;
  };

  // Delete with confirmation
  const deleteDish = (id: number) => {
    if (Platform.OS === "web") {
      const ok = window.confirm("Are you sure you want to delete this dish?");
      if (ok) {
        setDishes((prev) => {
          const updated = prev.filter((d) => d.id !== id);
          return [...updated]; // force new array reference
        });
        try {
          alert("✅ Dish deleted successfully!");
        } catch {}
      }
    } else {
      Alert.alert("Remove Dish", "Are you sure you want to delete this dish?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Remove",
          style: "destructive",
          onPress: () =>
            setDishes((prev) => {
              const updated = prev.filter((d) => d.id !== id);
              return [...updated];
            }),
        },
      ]);
    }
  };

  // Add with validation (non-empty, price > 0, course selected)
  const addDish = () => {
    if (!name.trim() || !description.trim() || !priceText.trim() || !course) {
      Alert.alert("Validation", "Please complete all fields.");
      return;
    }
    const price = Number(priceText);
    if (Number.isNaN(price) || price <= 0) {
      Alert.alert("Validation", "Enter a valid price above 0.");
      return;
    }
    setDishes((prev) => [
      {
        id: Date.now(),
        name: name.trim(),
        description: description.trim(),
        course,
        price,
      },
      ...prev,
    ]);
    setName("");
    setDesc("");
    setPriceText("");
    setCourse(null);
    setStep(1);
    setTab("Home");
  };

  // Derived metrics (Part 3)
  const averages = calcAverages(dishes);
  const totalCount = dishes.length;
  const overall =
    totalCount > 0
      ? (dishes.reduce((sum, d) => sum + d.price, 0) / totalCount).toFixed(2)
      : "0.00";

  // --- PART 2: UI components ---
  const DishCard = ({ dish }: { dish: Dish }) => (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {dish.name}
        </Text>
        <Text style={[styles.cardSub, { color: colors.secondary }]}>
          {dish.course}
        </Text>
        <Text style={[styles.cardDesc, { color: colors.muted }]}>
          {dish.description}
        </Text>
        <Text style={[styles.cardPrice, { color: colors.accent }]}>
          R {dish.price.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  // HOME + Part 3 Summary appended after list
  const Home = () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu</Text>

      {dishes.length === 0 ? (
        <Text
          style={{
            color: colors.muted,
            textAlign: "center",
            marginVertical: 20,
          }}
        >
          No dishes yet — add some in the Manage tab.
        </Text>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(d) => String(d.id)}
          renderItem={({ item }) => (
            <View
              style={[
                styles.menuCard,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.cardSub, { color: colors.secondary }]}>
                  {item.course}
                </Text>
                <Text style={[styles.cardDesc, { color: colors.muted }]}>
                  {item.description}
                </Text>
                <Text style={[styles.cardPrice, { color: colors.accent }]}>
                  R {item.price.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: colors.danger }]}
                onPress={() => deleteDish(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      {/* --- PART 3: Summary block (totals + averages) --- */}
      <View
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          backgroundColor: "#F3FAF9",
        }}
      >
        <Text
          style={{ fontWeight: "800", color: colors.text, marginBottom: 6 }}
        >
          Menu Summary
        </Text>
        <Text style={{ color: colors.muted, marginBottom: 6 }}>
          Total dishes: {totalCount}
        </Text>
        <Text style={{ color: colors.muted, marginBottom: 6 }}>
          Overall average: R{overall}
        </Text>
        {COURSES.map((c) => (
          <Text key={c} style={{ color: colors.secondary, fontWeight: "700" }}>
            {c}: R{averages[c]}
          </Text>
        ))}
      </View>
    </ScrollView>
  );

  // FILTER
  const Filter = () => {
    const [filter, setFilter] = useState<Course | null>(null);
    const filtered = filter
      ? dishes.filter((d) => d.course === filter)
      : dishes;
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Filter by Category
        </Text>
        <View style={styles.filterRow}>
          {COURSES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setFilter(c === filter ? null : c)}
              style={[
                styles.filterButton,
                {
                  backgroundColor: c === filter ? colors.secondary : "#F7FAFA",
                  borderColor: c === filter ? colors.secondary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: c === filter ? "#fff" : colors.text,
                  fontWeight: "700",
                }}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(d) => String(d.id)}
          renderItem={({ item }) => (
            <View style={[styles.filterCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.filterDishName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={{ color: colors.muted }}>{item.description}</Text>
              <Text style={[styles.filterPrice, { color: colors.secondary }]}>
                R {item.price}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: colors.muted }}>
              No dishes found
            </Text>
          }
        />
      </ScrollView>
    );
  };

  // MANAGE with validation (Part 3)
  const Manage = () => (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {step === 1 ? (
        <View
          style={[
            styles.creatorCard,
            { backgroundColor: "#F8FDFC", borderColor: colors.border },
          ]}
        >
          <Text style={[styles.creatorTitle, { color: colors.secondary }]}>
            👨‍🍳 Dish Creator
          </Text>
          <Text style={[styles.creatorSubtitle, { color: colors.muted }]}>
            Start crafting your next delicious meal below.
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Dish Name"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Short Description"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDesc}
          />
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.secondary }]}
            onPress={() => setStep(2)}
          >
            <Text style={styles.nextText}>Next ➡️</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Course & Price
          </Text>
          <View style={styles.courseRow}>
            {COURSES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCourse(c)}
                style={[
                  styles.courseCard,
                  {
                    backgroundColor:
                      course === c ? colors.secondary : "#F9F9F9",
                  },
                ]}
              >
                <Text
                  style={{
                    color: course === c ? "#fff" : colors.text,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Price (R)"
            keyboardType="numeric"
            placeholderTextColor={colors.muted}
            value={priceText}
            onChangeText={setPriceText}
          />
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: "#EAEAEA" }]}
              onPress={() => setStep(1)}
            >
              <Text style={[styles.backText, { color: colors.muted }]}>
                ⬅️ Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.accent }]}
              onPress={addDish}
            >
              <Text style={styles.saveText}>💾 Save Dish</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu Board */}
      <View style={{ marginTop: 28 }}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>
          🍽️ Your Menu Board
        </Text>
        <View
          style={[styles.titleBar, { backgroundColor: colors.secondary }]}
        />

        {dishes.length === 0 ? (
          <Text
            style={{ textAlign: "center", color: colors.muted, marginTop: 16 }}
          >
            No dishes yet — start adding to your menu!
          </Text>
        ) : (
          <FlatList
            data={dishes}
            keyExtractor={(d) => String(d.id)}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.menuCard,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cardSub, { color: colors.secondary }]}>
                    {item.course}
                  </Text>
                  <Text style={[styles.cardDesc, { color: colors.muted }]}>
                    {item.description}
                  </Text>
                  <Text style={[styles.cardPrice, { color: colors.accent }]}>
                    R {item.price.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: colors.danger }]}
                  onPress={() => deleteDish(item.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={{ flex: 1 }}>
        {tab === "Home" && <Home />}
        {tab === "Filter" && <Filter />}
        {tab === "Manage" && <Manage />}
      </View>

      <View
        style={[
          styles.tabbar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        {(["Home", "Filter", "Manage"] as TabKey[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tabItem,
              tab === t && { backgroundColor: "#F3FAF9" },
            ]}
            onPress={() => setTab(t)}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? colors.secondary : colors.text },
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screen: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 12,
  },
  creatorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  creatorTitle: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  creatorSubtitle: { fontSize: 13, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginVertical: 8 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", marginVertical: 8 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  filterCard: { borderRadius: 16, padding: 12, marginVertical: 6 },
  filterDishName: { fontSize: 16, fontWeight: "700" },
  filterPrice: { marginTop: 6, fontWeight: "700" },
  courseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  courseCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    marginHorizontal: 4,
    borderRadius: 14,
    elevation: 2,
  },
  nextBtn: {
    marginTop: 12,
    borderRadius: 30,
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  nextText: { color: "#fff", fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  backBtn: { borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24 },
  backText: { fontWeight: "700" },
  saveBtn: { borderRadius: 20, paddingVertical: 10, paddingHorizontal: 28 },
  saveText: { color: "#fff", fontWeight: "700" },
  menuTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  titleBar: { height: 3, width: 60, borderRadius: 2, marginBottom: 12 },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardSub: { fontSize: 12 },
  cardDesc: { fontSize: 12, marginTop: 2 },
  cardPrice: { marginTop: 6, fontWeight: "800" },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  deleteText: { color: "#fff", fontWeight: "700" },
  tabbar: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth },
  tabItem: { flex: 1, padding: 12, alignItems: "center" },
  tabText: { fontWeight: "700" },
});
