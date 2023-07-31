import { Slot } from "expo-router";
import Header from "../../components/header";

export default function Layout() {
  return (
    <>
      <Header/>
      <Slot/>
    </>
  )
}