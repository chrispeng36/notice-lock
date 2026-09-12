import EventKit
import Foundation

let store = EKEventStore()

struct Item: Encodable {
  let type: String
  let title: String
  let timeMs: Double
  let endMs: Double?
  let allDay: Bool
  let list: String
}

struct Output: Encodable {
  let items: [Item]
  let errors: [String]
}

func wait(_ sem: DispatchSemaphore, _ seconds: Double = 30) {
  _ = sem.wait(timeout: .now() + seconds)
}

func requestEventsAccess() -> Bool {
  var granted = false
  let sem = DispatchSemaphore(value: 0)
  if #available(macOS 14.0, *) {
    store.requestFullAccessToEvents { ok, _ in granted = ok; sem.signal() }
  } else {
    store.requestAccess(to: .event) { ok, _ in granted = ok; sem.signal() }
  }
  wait(sem)
  return granted
}

func requestRemindersAccess() -> Bool {
  var granted = false
  let sem = DispatchSemaphore(value: 0)
  if #available(macOS 14.0, *) {
    store.requestFullAccessToReminders { ok, _ in granted = ok; sem.signal() }
  } else {
    store.requestAccess(to: .reminder) { ok, _ in granted = ok; sem.signal() }
  }
  wait(sem)
  return granted
}

let now = Date()
let cal = Calendar.current
let startToday = cal.startOfDay(for: now)
let endToday = cal.date(byAdding: .day, value: 1, to: startToday)!

var items: [Item] = []
var errors: [String] = []

if requestEventsAccess() {
  let predicate = store.predicateForEvents(withStart: startToday, end: endToday, calendars: nil)
  for e in store.events(matching: predicate) {
    if e.status == .canceled { continue }
    if e.endDate < now { continue }
    items.append(Item(
      type: "calendar",
      title: e.title,
      timeMs: e.startDate.timeIntervalSince1970 * 1000,
      endMs: e.endDate.timeIntervalSince1970 * 1000,
      allDay: e.isAllDay,
      list: e.calendar?.title ?? ""
    ))
  }
} else {
  errors.append("calendar-denied")
}

if requestRemindersAccess() {
  let sem = DispatchSemaphore(value: 0)
  let predicate = store.predicateForReminders(in: nil)
  store.fetchReminders(matching: predicate) { reminders in
    if let reminders = reminders {
      for r in reminders {
        guard !r.isCompleted else { continue }
        guard let comps = r.dueDateComponents, let due = cal.date(from: comps) else { continue }
        let dueMs = due.timeIntervalSince1970 * 1000
        if dueMs >= 0 && dueMs <= endToday.timeIntervalSince1970 * 1000 {
          items.append(Item(
            type: "reminder",
            title: r.title ?? "",
            timeMs: dueMs,
            endMs: nil,
            allDay: false,
            list: r.calendar?.title ?? ""
          ))
        }
      }
    }
    sem.signal()
  }
  wait(sem)
} else {
  errors.append("reminders-denied")
}

let out = Output(items: items, errors: errors)
let encoder = JSONEncoder()
encoder.outputFormatting = [.withoutEscapingSlashes]
if let data = try? encoder.encode(out), let str = String(data: data, encoding: .utf8) {
  print(str)
}
